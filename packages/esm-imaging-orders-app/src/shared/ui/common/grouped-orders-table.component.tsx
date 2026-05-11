import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Order, useLayoutType } from '@openmrs/esm-framework';
import upperCase from 'lodash-es/upperCase';
import capitalize from 'lodash-es/capitalize';
import { mutate } from 'swr';
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableExpandedRow,
  TableExpandHeader,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  DataTable,
  TableContainer,
  Button,
  Dropdown,
  Pagination,
  Tag
} from '@carbon/react';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { Renew } from '@carbon/react/icons';

import ListOrderDetails from './list-order-details.component';
import { type GroupedOrdersTableProps } from './grouped-imaging-types';
import { type Result } from '../../../imaging-tabs/work-list/work-list.resource';
import TransitionLatestQueueEntryButton from '../../../imaging-tabs/test-ordered/transition-patient-new-queue/transition-latest-queue-entry-button.component';
import { OrdersDateRangePicker } from './orders-date-range-picker';
import EmptyState from '../../../empty-state/empty-state-component';

import styles from './grouped-orders-table.scss';

type OrderUrgency = 'ROUTINE' | 'STAT' | 'ON_SCHEDULED_DATE';

function translateGender(gender: string | undefined, t: (key: string, fallback: string) => string) {
  if (gender === 'M') return t('male', 'Male');
  if (gender === 'F') return t('female', 'Female');
  return gender;
}

function getPriorityTagType(urgency: OrderUrgency) {
  switch (urgency) {
    case 'ROUTINE':
      return 'green';
    case 'STAT':
      return 'red';
    default:
      return 'gray';
  }
}

const GroupedOrdersTable: React.FC<GroupedOrdersTableProps> = (props) => {
  const workListEntries = props.orders;
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const responseSize = useLayoutType() === 'tablet' ? 'lg' : 'md';

  const locationOptions = useMemo(() => {
    const seen = new Set<string>();
    const locations: Array<{ id: string; label: string }> = [{ id: '', label: t('allLocations', 'All locations') }];
    workListEntries.forEach((order) => {
      const loc = order.encounter?.location;
      if (loc?.uuid && !seen.has(loc.uuid)) {
        seen.add(loc.uuid);
        locations.push({ id: loc.uuid, label: loc.display });
      }
    });
    return locations;
  }, [workListEntries, t]);

  function groupOrdersById(orders) {
    if (orders && orders.length > 0) {
      const groupedOrders = orders.reduce((acc, item) => {
        if (!acc[item.patient.uuid]) {
          acc[item.patient.uuid] = [];
        }
        acc[item.patient.uuid].push(item);
        return acc;
      }, {});

      return Object.keys(groupedOrders).map((patientId) => ({
        patientId,
        orders: groupedOrders[patientId],
      }));
    }
    return [];
  }

  const groupedOrdersByPatient = groupOrdersById(workListEntries);

  const locationFilteredGroups = useMemo(() => {
    if (!selectedLocation) return groupedOrdersByPatient;
    return groupedOrdersByPatient
      .map((group) => ({
        ...group,
        orders: group.orders.filter((order: Result) => order.encounter?.location?.uuid === selectedLocation),
      }))
      .filter((group) => group.orders.length > 0);
  }, [groupedOrdersByPatient, selectedLocation]);

  const handleRefresh = () => {
    mutate((key) => typeof key === 'string' && key.includes('/order?'), undefined, {
      revalidate: true,
    });
  };

  const groupedOrdersByRowId = useMemo(
    () => Object.fromEntries(locationFilteredGroups.map((g) => [g.patientId, g])),
    [locationFilteredGroups],
  );

  const rowData = useMemo(() => {
    return locationFilteredGroups.map((patient) => ({
      id: patient.patientId,
      patientName: upperCase(patient.orders[0].patient?.person?.display),
      patientAge: patient?.orders[0]?.patient?.person?.age,
      patientGender: translateGender(patient?.orders[0]?.patient?.person?.gender, t),
      orders: patient.orders,
      totalOrders: patient.orders?.length,
      urgency: (() => {
        const urgency: OrderUrgency = patient.orders.some((order: Order) => order.urgency === 'STAT')
          ? 'STAT'
          : 'ROUTINE';
        return (
          // t('ON_SCHEDULED_DATE', 'On scheduled date')
          // t('ROUTINE', 'Routine')
          // t('STAT', 'STAT')
          <Tag type={getPriorityTagType(urgency)}>{t(urgency, capitalize(urgency.replaceAll('_', ' ')))}</Tag>
        );
      })(),
      fulfillerStatus: patient.orders[0].fulfillerStatus,
      action:
        patient.orders[0].fulfillerStatus === 'COMPLETED' ? (
          <TransitionLatestQueueEntryButton patientUuid={patient.patientId} />
        ) : null,
    }));
  }, [locationFilteredGroups, t]);

  const tableColumns = useMemo(() => {
    const baseColumns = [
      { key: 'patientName', header: t('patientName', 'Patient Name') },
      { key: 'patientAge', header: t('age', 'Age') },
      { key: 'patientGender', header: t('sex', 'Sex') },
      { key: 'totalOrders', header: t('totalOrders', 'Total Orders') },
      { key: 'urgency', header: t('urgency', 'Urgency') },
    ];

    const showActionColumn = workListEntries.some((order) => order.fulfillerStatus === 'COMPLETED');
    return showActionColumn ? [...baseColumns, { key: 'action', header: t('action', 'Action') }] : baseColumns;
  }, [workListEntries, t]);

  return (
    <div className={styles.container}>
      <div className={styles.widgetCard}>
        <CardHeader title={props?.title}>
          <Button size={responseSize} kind="ghost" renderIcon={Renew} onClick={handleRefresh}>
            {t('refresh', 'Refresh')}
          </Button>
        </CardHeader>
      </div>

      <DataTable size={responseSize} useZebraStyles rows={rowData} headers={tableColumns}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getExpandedRowProps,
          getTableProps,
          getTableContainerProps,
          getToolbarProps,
          onInputChange,
        }) => {
          const visibleRows = rows.slice((currentPage - 1) * currentPageSize, currentPage * currentPageSize);

          return (
            <TableContainer className={styles.tableContainer} {...getTableContainerProps()}>
              <TableToolbar {...getToolbarProps()} aria-label={t('tableToolbar', 'Table toolbar')}>
                <TableToolbarContent>
                  <TableToolbarSearch
                    onChange={(e) => {
                      if (e !== '') onInputChange(e);
                      setCurrentPage(1);
                    }}
                    placeholder={t('searchByPatientName', 'Search by patient name')}
                    persistent
                    className={styles.tableToolBarSearch}
                  />
                  <Dropdown
                    id="location-filter"
                    items={locationOptions}
                    itemToString={(item) => item?.label ?? ''}
                    label={t('allLocations', 'All locations')}
                    titleText={t('location', 'Location')}
                    hideLabel
                    type="inline"
                    onChange={({ selectedItem }) => {
                      setSelectedLocation(selectedItem?.id ?? '');
                      setCurrentPage(1);
                    }}
                    selectedItem={locationOptions.find((l) => l.id === selectedLocation) ?? locationOptions[0]}
                    size="lg"
                  />
                  <OrdersDateRangePicker />
                </TableToolbarContent>
              </TableToolbar>

              {rows.length === 0 ? (
                <EmptyState subTitle={t('noImagingOrdersFound', 'There are no imaging orders to display')} />
              ) : (
                <Table {...getTableProps()} aria-label={t('imagingOrders', 'Imaging Orders')}>
                  <TableHead>
                    <TableRow>
                      <TableExpandHeader aria-label={t('expandRow', 'Expand row')} />
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRows.map((row) => (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableExpandRow>
                        {row.isExpanded && (
                          <TableExpandedRow colSpan={headers.length + 1} {...getExpandedRowProps({ row })}>
                            <ListOrderDetails
                              actions={props.actions}
                              groupedOrders={groupedOrdersByRowId[row.id]}
                              showActions={props.showActions}
                              showOrderType={props.showOrderType}
                              showStartButton={props.showStartButton}
                              showStatus={props.showStatus}
                            />
                          </TableExpandedRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              )}

              {rows.length > currentPageSize && (
                <Pagination
                  className={styles.paginationOverride}
                  backwardText={t('previousPage', 'Previous page')}
                  forwardText={t('nextPage', 'Next page')}
                  itemsPerPageText={t('itemsPerPage', 'Items per page:')}
                  page={currentPage}
                  pageNumberText={t('pageNumber', 'Page Number')}
                  pageSize={currentPageSize}
                  pageSizes={[10, 20, 30, 40, 50]}
                  size={responseSize}
                  totalItems={rows.length}
                  onChange={({ page, pageSize }) => {
                    setCurrentPage(page);
                    setCurrentPageSize(pageSize);
                  }}
                />
              )}
            </TableContainer>
          );
        }}
      </DataTable>
    </div>
  );
};

export default GroupedOrdersTable;
