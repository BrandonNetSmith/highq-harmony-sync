
/**
 * This file contains mock data for field discovery
 * These simulate API responses used during development
 */

/**
 * Returns mock fields for GHL based on the data type
 */
export const getGHLMockFields = (dataType: string): string[] => {
  switch(dataType) {
    case 'contact':
      return [
        'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip',
        'custom.preferredContactMethod', 'custom.leadSource', 'custom.insuranceProvider',
        'dateOfBirth', 'companyName', 'tags', 'source', 'assignedTo', 'notes'
      ];
    case 'appointment':
      return [
        'startTime', 'endTime', 'title', 'description', 'location', 'status',
        'notes', 'reminders', 'assignedTo', 'custom.appointmentType', 'custom.preAppointmentNotes'
      ];
    case 'form':
      return [
        'formName', 'createdDate', 'status', 'isActive', 'fields',
        'custom.formCategory', 'custom.displayOrder', 'custom.requiredFields'
      ];
    default:
      return [];
  }
};

/**
 * Returns mock fields for IntakeQ based on the data type
 */
export const getIntakeQMockFields = (dataType: string): string[] => {
  switch(dataType) {
    case 'contact':
      return [
        'firstName', 'lastName', 'email', 'phoneNumber', 'address', 'city', 'state', 'zipCode',
        'dateOfBirth', 'gender', 'emergencyContact', 'insuranceInfo', 'clientNotes',
        'custom.firstVisitDate', 'custom.patientID', 'custom.referralSource'
      ];
    case 'appointment':
      return [
        'appointmentDate', 'startTime', 'endTime', 'appointmentType', 'practitioner',
        'location', 'roomNumber', 'status', 'notes', 'custom.followUpRequired',
        'custom.appointmentPurpose', 'custom.visitNumber'
      ];
    case 'form':
      return [
        'formTitle', 'createdAt', 'updatedAt', 'status', 'formFields',
        'isTemplate', 'custom.formCategory', 'custom.displayOrder', 'custom.requiredSignature'
      ];
    default:
      return [];
  }
};
