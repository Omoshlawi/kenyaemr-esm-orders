import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  radiologyConceptSetUuid: {
    _type: Type.String,
    _description: 'Radiology Concept SET UUID',
    _default: '164068AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  radiologyConceptClassUuid: {
    _type: Type.String,
    _description: 'Radiology Concept Class UUID',
    _default: '8caa332c-efe4-4025-8b18-3398328e1323',
  },
  orders: {
    radiologyOrderTypeUuid: {
      _type: Type.UUID,
      _description: "UUID for the 'Radiology' order type",
      _default: 'b4a7c280-369e-4d12-9ce8-18e36783fed6',
    },
    labOrderTypeUuid: {
      _type: Type.UUID,
      _description: "UUID for the 'Lab' order type",
      _default: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
    },
    labOrderableConcepts: {
      _type: Type.Array,
      _description:
        'UUIDs of concepts that represent orderable lab tests or lab sets. If an empty array `[]` is provided, every concept with class `Test` will be considered orderable.',
      _elements: {
        _type: Type.UUID,
      },
      _default: [],
    },
  },
  radiologyOrdersRequiringRenalFunctionCheck: {
    _type: Type.Array,
    _description:
      'Radiology procedures that require recent renal function lab results before ordering. For each configured procedure, the system checks whether a valid lab result exists within the specified time window and warns the clinician if none is found.',
    _elements: {
      procedureConceptUuid: {
        _type: Type.ConceptUuid,
        _description:
          'UUID of the radiology procedure concept that triggers the renal function check (e.g. contrast-enhanced CT scan).',
      },
      labResultValidityPeriodInDays: {
        _type: Type.Number,
        _description:
          'Number of days a renal function lab result remains valid. Results older than this will trigger a warning to the clinician.',
      },
    },
    _default: [],
  },
  renalFunctionTestConceptUuid: {
    _type: Type.ConceptUuid,
    _description:
      'UUID of the lab test (or test panel) used to assess renal function. Results for this concept are checked against the validity period configured for each radiology procedure in radiologyOrdersRequiringRenalFunctionCheck.',
    _default: '161488AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  useDicom: {
    _type: Type.String,
    _description: 'Whether we want to enable showing dicom images',
    _default: false,
  },
  orthancServerUrl: {
    _type: Type.String,
    _description: 'Base URL of the Orthanc DICOM server (e.g. http://localhost:8042)',
    _default: 'http://localhost:8042',
  },
  orthancUsername: {
    _type: Type.String,
    _description: 'Username for Orthanc Basic Auth',
    _default: '',
  },
  orthancPassword: {
    _type: Type.String,
    _description: 'Password for Orthanc Basic Auth',
    _default: '',
  },
};

interface OrderReason {
  labTestUuid: string;
  required: boolean;
  orderReasons: Array<string>;
}
export type ImagingConfig = {
  radiologyConceptSetUuid: string;
  orders: {
    labOrderTypeUuid: string;
    labOrderableConcepts: Array<string>;
    radiologyOrderTypeUuid: string;
  };
  labTestsWithOrderReasons: Array<OrderReason>;
  radiologyConceptClassUuid: string;
  radiologyOrdersRequiringRenalFunctionCheck: Array<{
    procedureConceptUuid: string;
    labResultValidityPeriodInDays: number;
  }>;
  renalFunctionTestConceptUuid: string;
  orthancServerUrl: string;
  orthancUsername: string;
  orthancPassword: string;
  useDicom: boolean;
};
