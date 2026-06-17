/**
 * Thai strings for provisioning-ui module.
 */
define([], function () {
  return {
    ConfirmDialog: { ConfirmLabel: 'ยืนยัน', CancelLabel: 'ยกเลิก' },
    LogPanel: { EmptyMessage: 'ไม่มีบันทึกที่พร้อมใช้งาน' },
    ComplianceLogPanel: { EmptyMessage: 'ไม่มีผลลัพธ์การปฏิบัติตามข้อกำหนดที่พร้อมใช้งาน' },
    ProvisioningActivityEntry: {
      PendingLabel: 'รอดำเนินการ', RunningLabel: 'กำลังทำงาน', ExecutedLabel: 'ดำเนินการแล้ว', FailedLabel: 'ล้มเหลว', SkippedLabel: 'ข้ามแล้ว',
      SkipReasonNotFound: 'ไม่พบ', SkipReasonAlreadyExists: 'มีอยู่แล้ว', SkipReasonNoChanges: 'ไม่มีการเปลี่ยนแปลง', SkipReasonMissingPrerequisite: 'ขาดข้อกำหนดเบื้องต้น', SkipReasonUnsupported: 'ไม่รองรับ',
    },
    ComplianceActivityEntry: {
      CompliantLabel: 'สอดคล้อง', NonCompliantLabel: 'ไม่สอดคล้อง', UnverifiableLabel: 'ไม่สามารถตรวจสอบได้', IgnoredLabel: 'ละเว้นแล้ว', BlockedLabel: 'ถูกบล็อก',
      PendingLabel: 'รอดำเนินการ', RunningLabel: 'กำลังตรวจสอบ', CancelledLabel: 'ยกเลิกแล้ว',
      BlockedByPrefix: 'ถูกบล็อกโดย',
    },
    ProvisioningDialog: {
      DefaultTitle: 'การเตรียมใช้งาน', CloseButtonAriaLabel: 'ปิด', CloseLabel: 'ปิด', BackToProvisioningLabel: 'กลับ',
      TargetSiteLabel: 'ไซต์เป้าหมาย', TargetSiteMissingTitle: 'ไม่มีไซต์เป้าหมาย', TargetSiteMissingMessage: 'เลือกไซต์เป้าหมายในคุณสมบัติ Web Part ก่อนเรียกใช้การเตรียมใช้งาน', ErrorFallbackCode: 'ข้อผิดพลาด',
      TotalLabel: 'ทั้งหมด', SuccessLabel: 'สำเร็จ', FailLabel: 'ล้มเหลว', SkippedLabel: 'ข้ามแล้ว', PendingLabel: 'รอดำเนินการ', CompletedLabel: 'เสร็จสมบูรณ์',
      FinalOutcomeSucceededLabel: 'สำเร็จ', FinalOutcomeFailedLabel: 'ล้มเหลว', FinalOutcomeCancelledLabel: 'ยกเลิกแล้ว', FinalOutcomeRunningLabel: 'กำลังทำงาน',
      InitialHelpProvisioningText: 'ใช้ เรียกใช้ เพื่อเริ่มการเตรียมใช้งานกับไซต์เป้าหมาย คุณสามารถตรวจสอบความคืบหน้าและบันทึกขณะดำเนินการได้', InitialHelpComplianceText: 'ใช้ ตรวจสอบ เพื่อดูตัวอย่างปัญหาการปฏิบัติตามข้อกำหนดก่อนใช้การเปลี่ยนแปลง',
      ProvisioningDefaultDescription: 'เรียกใช้การเตรียมใช้งานโดยใช้แผนที่กำหนดค่าไว้', ComplianceDefaultDescription: 'เรียกใช้การตรวจสอบการปฏิบัติตามข้อกำหนดโดยใช้แผนที่กำหนดค่าไว้',
      ViewLogsLabel: 'ดูบันทึก', CheckComplianceLabel: 'ตรวจสอบ', CancelLabel: 'ยกเลิก', RunLabel: 'เรียกใช้',
      ConfirmRunTitle: 'ยืนยันการเรียกใช้', ConfirmRunMessage: 'คุณแน่ใจหรือไม่ว่าต้องการเริ่มการเรียกใช้?',
      ComplianceDefaultTitle: 'การปฏิบัติตามข้อกำหนด', ComplianceHeaderLabel: 'การตรวจสอบการปฏิบัติตามข้อกำหนด', RunCheckLabel: 'เรียกใช้การตรวจสอบ', CancelCheckLabel: 'ยกเลิก', CheckingLabel: 'กำลังตรวจสอบการปฏิบัติตามข้อกำหนด...',
      OverallCompliantLabel: 'สอดคล้อง', OverallWarningLabel: 'คำเตือน', OverallNonCompliantLabel: 'ไม่สอดคล้อง', OverallRunningLabel: 'กำลังทำงาน', OverallCancelledLabel: 'ยกเลิกแล้ว',
      CheckedLabel: 'ตรวจสอบแล้ว', BlockedLabel: 'ถูกบล็อก', CompliantLabel: 'สอดคล้อง', NonCompliantLabel: 'ไม่สอดคล้อง', UnverifiableLabel: 'ไม่สามารถตรวจสอบได้', IgnoredLabel: 'ละเว้นแล้ว',
      ComplianceTargetSiteMissingTitle: 'ไซต์เป้าหมาย', ComplianceTargetSiteMissingMessage: 'ต้องมี URL ของไซต์เป้าหมายเพื่อเรียกใช้การตรวจสอบการปฏิบัติตามข้อกำหนด', ComplianceErrorFallbackTitle: 'ข้อผิดพลาด',
    },
    PropertyPaneProvisioningField: {
      DefaultLabel: 'การเตรียมใช้งานเทมเพลต', ProvisionLabel: 'เตรียมใช้งาน', DeprovisionLabel: 'ยกเลิกการเตรียมใช้งาน', CheckLabel: 'ตรวจสอบ',
      StateAppliedLabel: 'นำไปใช้แล้ว', StateNotAppliedLabel: 'ยังไม่ได้นำไปใช้', StateUnknownLabel: 'ไม่ทราบ',
      ProvisioningDialogTitle: 'การเตรียมใช้งาน', ProvisioningDialogDescription: 'เรียกใช้การเตรียมใช้งานโดยใช้แผนที่กำหนดค่าไว้', DeprovisioningDialogTitle: 'การยกเลิกการเตรียมใช้งาน', DeprovisioningDialogDescription: 'เรียกใช้การยกเลิกการเตรียมใช้งานโดยใช้แผนที่กำหนดค่าไว้',
      DeprovisionConfirmRunTitle: 'ยืนยันการยกเลิกการเตรียมใช้งาน', DeprovisionConfirmRunMessage: 'คุณแน่ใจหรือไม่ว่าต้องการเริ่มการยกเลิกการเตรียมใช้งาน?', DeprovisionConfirmLabel: 'ยกเลิกการเตรียมใช้งาน', DeprovisionCancelLabel: 'ยกเลิก',
    },
    SiteSelectorField: {
      DefaultLabel: 'ไซต์เป้าหมาย', CurrentSiteLabel: 'ไซต์ปัจจุบัน', HubSiteLabel: 'ไซต์ฮับหลัก', HubNotAvailableLabel: 'ไม่พร้อมใช้งาน', SearchSiteLabel: 'ค้นหาไซต์',
      SelectedSiteGroupAriaLabel: 'ไซต์ที่เลือก', SearchSitesAriaLabel: 'ค้นหาไซต์', SearchPlaceholder: 'ค้นหาตามชื่อเรื่องหรือ URL',
      SearchingLabel: 'กำลังค้นหา', EmptySearchLabel: 'พิมพ์เพื่อค้นหา', NoResultsLabel: 'ไม่พบผลลัพธ์',
    },
    NavigationGuard: { LeavePageWarning: 'มีการดำเนินการอยู่ หากคุณออก การดำเนินการจะถูกขัดจังหวะ' },
  };
});
