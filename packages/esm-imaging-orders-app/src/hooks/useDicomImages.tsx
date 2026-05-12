import { useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type ImagingConfig } from '../config-schema';

export interface DicomStudyMainTags {
  AccessionNumber: string;
  InstitutionName: string;
  ReferringPhysicianName: string;
  StudyDate: string;
  StudyDescription: string;
  StudyID: string;
  StudyInstanceUID: string;
  StudyTime: string;
}

export interface DicomPatientMainTags {
  PatientBirthDate: string;
  PatientID: string;
  PatientName: string;
  PatientSex: string;
}

export interface DicomStudy {
  ID: string;
  IsStable: boolean;
  Labels: Array<string>;
  LastUpdate: string;
  MainDicomTags: DicomStudyMainTags;
  ParentPatient: string;
  PatientMainDicomTags: DicomPatientMainTags;
  Series: Array<string>;
  Type: string;
}

async function fetchDicomStudies(
  orthancServerUrl: string,
  authHeader: string,
  accessionNumber: string,
): Promise<Array<DicomStudy>> {
  const response = await fetch(`${orthancServerUrl}/tools/find`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify({
      Level: 'Study',
      Query: { AccessionNumber: accessionNumber },
      Expand: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Orthanc request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function useDicomImages(accessionNumber: string) {
  const { orthancServerUrl, orthancUsername, orthancPassword } = useConfig<ImagingConfig>();

  // TODO: use single-sign on or proxy this through openmrs-module-orderexpansion module
  const authHeader = btoa(`${orthancUsername}:${orthancPassword}`);

  const { data, error, isLoading } = useSWR<DicomStudy[]>(
    accessionNumber ? [orthancServerUrl, accessionNumber] : null,
    ([url, accNo]: [string, string]) => fetchDicomStudies(url, authHeader, accNo),
  );

  return {
    studies: data ?? [],
    isLoading,
    error,
  };
}
