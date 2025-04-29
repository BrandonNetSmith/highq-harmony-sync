
/**
 * Mock data for GHL fields based on data type
 */
export const getGHLMockFields = (dataType: string): string[] => {
  switch (dataType) {
    case 'contact':
      return [
        'firstName',
        'lastName',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zipCode',
        'dateOfBirth',
        'gender',
        'emergencyContact',
        'insuranceInfo',
        'notes',
        'companyName',
        'assignedTo',
        'custom.preferredContactMethod',
        'custom.leadSource',
        'custom.insuranceProvider',
        'custom.insurancecompany',
        'custom.memberid',
        'custom.medicalhistory'
      ];
    case 'appointment':
      return [
        'startTime',
        'endTime',
        'appointmentType',
        'status',
        'notes',
        'location',
        'provider',
        'subject',
        'description',
        'confirmed',
        'reminder',
        'customFields.reasonForVisit',
        'customFields.insuranceProvider',
        'customFields.previousVisit'
      ];
    case 'form':
      return [
        'formName',
        'formType',
        'description',
        'status',
        'createdAt',
        'updatedAt',
        'fields.firstName',
        'fields.lastName',
        'fields.email',
        'fields.phone',
        'fields.address',
        'fields.message',
        'fields.custom1',
        'fields.custom2'
      ];
    default:
      return [];
  }
};

/**
 * Mock data for IntakeQ fields based on data type
 */
export const getIntakeQMockFields = (dataType: string): string[] => {
  switch (dataType) {
    case 'contact':
      return [
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'address',
        'city',
        'state',
        'zipCode',
        'dateOfBirth',
        'gender',
        'emergencyContact',
        'insuranceInfo',
        'clientNotes',
        'custom.firstVisitDate',
        'custom.patientID',
        'custom.referralSource',
        // Additional fields that might be in the system
        'custom.insuranceCompany',
        'custom.memberID',
        'custom.medicalHistory'
      ];
    case 'appointment':
      return [
        'appointmentDate',
        'appointmentTime',
        'duration',
        'serviceType',
        'status',
        'notes',
        'location',
        'provider',
        'subject',
        'description',
        'confirmed',
        'reminder',
        'custom.followupRequired',
        'custom.reasonForVisit',
        'custom.previousProcedures'
      ];
    case 'form':
      return [
        'formTitle',
        'formType',
        'description',
        'status',
        'createdAt',
        'updatedAt',
        'questions.personalInfo',
        'questions.medicalHistory',
        'questions.insuranceInfo',
        'questions.consent',
        'questions.custom1',
        'questions.custom2'
      ];
    default:
      return [];
  }
};
