import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
export const Table = (props: Readonly<TableHTMLAttributes<HTMLTableElement>>) => (
  <table className="w-full" {...props} />
);
export const TableHeader = (props: Readonly<HTMLAttributes<HTMLTableSectionElement>>) => (
  <thead {...props} />
);
export const TableBody = (props: Readonly<HTMLAttributes<HTMLTableSectionElement>>) => (
  <tbody {...props} />
);
export const TableRow = (props: Readonly<HTMLAttributes<HTMLTableRowElement>>) => <tr {...props} />;
export const TableHead = (props: Readonly<ThHTMLAttributes<HTMLTableCellElement>>) => (
  <th className="border-b p-3 text-left" {...props} />
);
export const TableCell = (props: Readonly<TdHTMLAttributes<HTMLTableCellElement>>) => (
  <td className="border-b p-3" {...props} />
);
