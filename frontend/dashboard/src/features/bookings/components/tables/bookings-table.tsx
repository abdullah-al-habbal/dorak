'use client';

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { Booking } from '@/features/bookings/types/booking';

interface BookingsTableProps {
  bookings: Booking[];
  onSelect: (booking: Booking) => void;
}

export function BookingsTable({ bookings, onSelect }: Readonly<BookingsTableProps>) {
  const table = useReactTable({
    columns: [
      { accessorKey: 'time_slot', header: 'Time' },
      { accessorFn: (booking) => booking.barber?.name.en ?? '—', header: 'Stylist' },
      { accessorFn: (booking) => booking.chair?.label ?? '—', header: 'Chair' },
      { accessorKey: 'status', header: 'Status' },
    ],
    data: bookings,
    getCoreRowModel: getCoreRowModel(),
  });

  return <table className="w-full border-collapse bg-surface"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th className="border-b p-3 text-left" key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr className="cursor-pointer hover:bg-muted" key={row.id} onClick={() => onSelect(row.original)}>{row.getVisibleCells().map((cell) => <td className="border-b p-3" key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table>;
}
