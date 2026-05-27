import { Project, Node, SourceFile } from "ts-morph";
import { glob } from "glob";
import * as path from "path";
import * as fs from "fs";

interface ExportInfo {
    name: string;
    isType: boolean;
}

/**
 * Checks if a node has a specific TSDoc release tag.
 */
function hasReleaseTag(node: Node, tag: "@public" | "@internal" | "@beta" | "@alpha"): boolean {
    const jsDocs = Node.isJSDocable(node) ? node.getJsDocs() : [];

    for (const jsDoc of jsDocs) {
        const fullText = jsDoc.getFullText();
        if (fullText.includes(tag)) {
            return true;
        }
    }

    return false;
}

/**
 * Checks if a node is public (has @public or no release tag).
 * Excludes nodes explicitly marked @internal, @alpha, or @beta.
 */
function isPublicExport(node: Node, requireExplicitPublic: boolean): boolean {
    if (hasReleaseTag(node, "@internal")) return false;
    if (hasReleaseTag(node, "@alpha")) return false;
    if (hasReleaseTag(node, "@beta")) return false;

    if (requireExplicitPublic) {
        return hasReleaseTag(node, "@public");
    }

    // If not requiring explicit @public, treat unmarked as public
    return true;
}

/**
 * Extracts public exports from a source file.
 */
function getPublicExports(sourceFile: SourceFile, requireExplicitPublic: boolean): ExportInfo[] {
    const exports: ExportInfo[] = [];

    // Exported functions
    for (const func of sourceFile.getFunctions()) {
        if (func.isExported() && isPublicExport(func, requireExplicitPublic)) {
            const name = func.getName();
            if (name) {
                exports.push({ name, isType: false });
            }
        }
    }

    // Exported classes
    for (const cls of sourceFile.getClasses()) {
        if (cls.isExported() && isPublicExport(cls, requireExplicitPublic)) {
            const name = cls.getName();
            if (name) {
                exports.push({ name, isType: false });
            }
        }
    }

    // Exported interfaces
    for (const iface of sourceFile.getInterfaces()) {
        if (iface.isExported() && isPublicExport(iface, requireExplicitPublic)) {
            const name = iface.getName();
            if (name) {
                exports.push({ name, isType: true });
            }
        }
    }

    // Exported type aliases
    for (const typeAlias of sourceFile.getTypeAliases()) {
        if (typeAlias.isExported() && isPublicExport(typeAlias, requireExplicitPublic)) {
            const name = typeAlias.getName();
            if (name) {
                exports.push({ name, isType: true });
            }
        }
    }

    // Exported enums
    for (const enumDecl of sourceFile.getEnums()) {
        if (enumDecl.isExported() && isPublicExport(enumDecl, requireExplicitPublic)) {
            const name = enumDecl.getName();
            if (name) {
                exports.push({ name, isType: false });
            }
        }
    }

    // Exported variables/constants
    for (const varStatement of sourceFile.getVariableStatements()) {
        if (varStatement.isExported() && isPublicExport(varStatement, requireExplicitPublic)) {
            for (const decl of varStatement.getDeclarations()) {
                const name = decl.getName();
                if (name) {
                    exports.push({ name, isType: false });
                }
            }
        }
    }

    return exports;
}

/**
 * Generates barrel content for a directory.
 */
function generateBarrelContent(
    directory: string,
    project: Project,
    requireExplicitPublic: boolean
): string {
    const lines: string[] = [
        "/**",
        " * Auto-generated barrel export.",
        " * Only @public exports are included.",
        " * @module",
        " */",
        "",
    ];

    const tsFiles = glob.sync("*.ts", {
        cwd: directory,
        ignore: ["index.ts", "*.test.ts", "*.spec.ts", "*.d.ts"],
    });

    for (const file of tsFiles.sort()) {
        const filePath = path.join(directory, file);
        const sourceFile = project.addSourceFileAtPath(filePath);
        const publicExports = getPublicExports(sourceFile, requireExplicitPublic);

        if (publicExports.length === 0) continue;

        const moduleName = `./${path.basename(file, ".ts")}`;

        const valueExports = publicExports.filter((e) => !e.isType);
        const typeExports = publicExports.filter((e) => e.isType);

        if (valueExports.length > 0) {
            const names = valueExports.map((e) => e.name).join(", ");
            lines.push(`export { ${names} } from "${moduleName}";`);
        }

        if (typeExports.length > 0) {
            const names = typeExports.map((e) => e.name).join(", ");
            lines.push(`export type { ${names} } from "${moduleName}";`);
        }
    }

    return lines.join("\n") + "\n";
}

/**
 * Main entry point.
 */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const requireExplicitPublic = args.includes("--require-public");
    const dryRun = args.includes("--dry-run");

    const project = new Project({
        tsConfigFilePath: path.resolve(__dirname, "../tsconfig.base.json"),
    });

    // Find package source directories with TypeScript files (excluding generated output).
    const directories = await glob("packages/*/src/**/", {
        ignore: ["**/node_modules/**", "**/dist/**", "**/lib/**", "**/__tests__/**"],
    });

    for (const dir of directories) {
        const fullDir = path.resolve(dir);
        const tsFiles = await glob("*.ts", {
            cwd: fullDir,
            ignore: ["index.ts", "*.test.ts", "*.spec.ts"],
        });

        if (tsFiles.length === 0) continue;

        const content = generateBarrelContent(fullDir, project, requireExplicitPublic);
        const indexPath = path.join(fullDir, "index.ts");

        if (dryRun) {
            console.log(`\n--- ${indexPath} ---`);
            console.log(content);
        } else {
            fs.writeFileSync(indexPath, content, "utf-8");
            console.log(`Generated: ${indexPath}`);
        }
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
