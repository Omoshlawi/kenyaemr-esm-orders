import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

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
  uuid: string;
  stable: boolean;
  lastUpdate: string;
  mainDicomTags: DicomStudyMainTags;
  patientMainDicomTags: DicomPatientMainTags;
}

interface DicomStudyResponse {
  results: Array<DicomStudy>;
}

export function useDicomImages(accessionNumber: string) {
  const url = accessionNumber ? `${restBaseUrl}/dicomstudy?accessionNumber=${accessionNumber}` : null;

  const { data, error, isLoading } = useSWR<DicomStudyResponse>(url, (path: string) =>
    openmrsFetch<DicomStudyResponse>(path).then((res) => res.data),
  );

  return {
    studies: data?.results ?? [],
    isLoading,
    error,
  };
}
