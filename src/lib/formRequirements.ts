export enum Requirements {
  MERCHANT_APPLICATION = 'MERCHANT_APPLICATION',
  ARTICLES_OF_INCORPORATION = 'ARTICLES_OF_INCORPORATION',
  EIN_LETTER = 'EIN_LETTER',
  BANK_LETTER_OR_VOIDED_CHECK = 'BANK_LETTER_OR_VOIDED_CHECK',
  PROCESSING_STATEMENTS = 'PROCESSING_STATEMENTS',
  BANK_STATEMENTS = 'BANK_STATEMENTS',
  FULFILMENT_AGREEMENT = 'FULFILMENT_AGREEMENT',
  GOVERNMENT_ID_FRONT = 'GOVERNMENT_ID_FRONT',
  GOVERNMENT_ID_BACK = 'GOVERNMENT_ID_BACK',
  OTHER = 'OTHER',
}

export const requirementsConfig: Record<
  Requirements,
  {
    label: string;
    description: string;
    type: 'file' | 'text' | 'number' | 'date';
    expectedFileCount: number;
    requiredFileCount: number;
    warningMessage?: string;
    userConfirmationText?: string;
    options?: string[];
  }
> = {
  [Requirements.MERCHANT_APPLICATION]: {
    label: 'Merchant Application',
    description: 'Download the application, fill out the form, sign it, then upload the signed application here',
    type: 'file',
    requiredFileCount: 1,
    expectedFileCount: 1,
  },
  [Requirements.ARTICLES_OF_INCORPORATION]: {
    label: 'Articles of Incorporation',
    description: '',
    type: 'file',
    warningMessage: 'Articles of Incorporation are required for LLCs and Corporations',
    userConfirmationText: 'This does not apply to me',
    requiredFileCount: 0,
    expectedFileCount: 1,
  },
  [Requirements.EIN_LETTER]: {
    label: 'EIN Letter',
    description: '',
    type: 'file',
    warningMessage: 'EIN Letter is required if you use an EIN number',
    userConfirmationText: 'This does not apply to me',
    requiredFileCount: 0,
    expectedFileCount: 1,
  },
  [Requirements.BANK_LETTER_OR_VOIDED_CHECK]: {
    label: 'Bank Letter or Voided Check',
    description: '',
    type: 'file',
    requiredFileCount: 1,
    expectedFileCount: 1,
  },
  [Requirements.PROCESSING_STATEMENTS]: {
    label: 'Processing Statements',
    description: '3 months of processing statements',
    type: 'file',
    warningMessage: 'Expected at least 3 files',
    userConfirmationText: 'I have uploaded the required files',
    requiredFileCount: 0,
    expectedFileCount: 3,
  },
  [Requirements.BANK_STATEMENTS]: {
    label: 'Bank Statements',
    description: '3 months of bank statements',
    type: 'file',
    warningMessage: 'Expected at least 3 files',
    userConfirmationText: 'I have uploaded the required files',
    requiredFileCount: 1,
    expectedFileCount: 3,
  },
  [Requirements.FULFILMENT_AGREEMENT]: {
    label: 'Fulfillment Agreement',
    description:
      'The fulfillment agreement is a contract between the merchant and the fulfillment company. It is a legal document that outlines the terms and conditions of the fulfillment agreement.',
    type: 'file',
    warningMessage: 'Fulfillment agreement is required in most cases',
    userConfirmationText: 'This does not apply to me',
    requiredFileCount: 0,
    expectedFileCount: 1,
  },
  [Requirements.GOVERNMENT_ID_FRONT]: {
    label: 'Government issued ID',
    description: 'Front of the government issued ID.',
    type: 'file',
    requiredFileCount: 1,
    expectedFileCount: 1,
  },
  [Requirements.GOVERNMENT_ID_BACK]: {
    label: 'Government issued ID',
    description: 'Back of the government issued ID.',
    type: 'file',
    requiredFileCount: 0,
    expectedFileCount: 1,
  },
  [Requirements.OTHER]: {
    label: 'Other',
    description: 'Any other required documents.',
    type: 'file',
    requiredFileCount: 0,
    expectedFileCount: 0,
  },
};
