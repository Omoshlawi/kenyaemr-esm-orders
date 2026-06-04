import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import { type Result } from '../types';
import { useStandardTheatreList } from './completed-list.resource';
import ExpandedResults from './expanded-results.component';
import ExportStandardTheatreList from './export-standard.theatre-list.component';

type StandardTheatreListProps = {
  patientOrders?: Array<{ patientId: string; orders: Array<Result> }>;
  onClose: () => void;
};

const StandardTheatreList: React.FC<StandardTheatreListProps> = ({ patientOrders, onClose }) => {
  const { t } = useTranslation();
  const headers = [
    { key: 'patientName', header: t('patientName', 'Patient Name') },
    { key: 'ipNo', header: t('ipNo', 'IP/NO') },
    { key: 'patientGender', header: t('sex', 'Sex') },
    { key: 'patientAge', header: t('age', 'Age') },
    { key: 'diagnosis', header: t('diagnosis', 'Diagnosis') },
    { key: 'operation', header: t('operation', 'Operation') },
    { key: 'surgeon', header: t('surgeon', 'Surgeon & Ass.Surgeon') },
    { key: 'anesthetist', header: t('anesthetist', 'Anesthetist') },
    { key: 'scrubNurse', header: t('scrubNurse', 'Scrub Nurse') },
    { key: 'remarks', header: t('remarks', 'Remarks') },
  ];
  const { error, isLoading, list } = useStandardTheatreList(patientOrders);
  const rows = useMemo(() => {
    return list?.map((l) => ({ ...l, id: l.id }));
  }, [list]);
  return (
    <React.Fragment>
      <ModalHeader closeModal={onClose} title={t('standardTheatreList', 'Standard theatre list')} />
      <ModalBody>
        {isLoading && <DataTableSkeleton />}
        {error && <ErrorState headerTitle={t('error', 'Error')} error={error} />}
        {!isLoading && !error && (
          <DataTable rows={rows} headers={headers}>
            {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getCellProps }) => (
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader aria-label={t('expandRow', 'Expand row')} />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell {...getCellProps({ cell })}>{cell.value}</TableCell>
                        ))}
                      </TableExpandRow>

                      {row && row.isExpanded ? (
                        <TableExpandedRow colSpan={headers.length + 1}>
                          <ExpandedResults orderUuid={row.id} patientOrders={patientOrders} />
                        </TableExpandedRow>
                      ) : (
                        <TableExpandedRow colSpan={headers.length + 2} />
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataTable>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <ExportStandardTheatreList patientOrders={patientOrders} onClose={onClose} />
      </ModalFooter>
    </React.Fragment>
  );
};

export default StandardTheatreList;
