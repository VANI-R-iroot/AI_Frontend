import React from "react";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

const DashboardTable: React.FC = () => {
  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "firstName",
      headerName: "First name",
      width: 150,
      editable: true,
    },
    {
      field: "lastName",
      headerName: "Last name",
      width: 150,
      editable: true,
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      width: 110,
      editable: true,
    },
    {
      field: "fullName",
      headerName: "Full name",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      width: 160,
      valueGetter: (_value, row) =>
        `${row.firstName || ""} ${row.lastName || ""}`,
    },
  ];

  const rows = [
    { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
    { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
    { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
    { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
    { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
    { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
    { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
    { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
    { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
  ];

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{
          backgroundColor: "rgba(52, 62, 87, 0)",
          color: "#E2E8F0",
          border: "none",

          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(52, 62, 87, 0)",
            color: "#E2E8F0",
            borderBottom: "1px solid rgba(8, 9, 10, 0.2)",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
            color: "#E2E8F0",
          },

          "& .MuiDataGrid-row": {
            backgroundColor: "rgba(52, 62, 87, 0)",
          },
          "& .MuiDataGrid-cell": {
            color: "#E2E8F0",
            borderColor: "rgba(71, 85, 105, 0.33)",
          },
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },

          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "rgba(52, 62, 87, 0)",
            color: "#E2E8F0",
            borderTop: "1px solid rgba(71, 85, 105, 0.33)",
          },

          "& .MuiTablePagination-root, & .MuiSelect-select, & .MuiTablePagination-actions button":
            {
              color: "#E2E8F0",
            },

          "& .MuiCheckbox-root svg": {
            fill: "#E2E8F0",
          },

          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
            width: "8px",
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
            backgroundColor: "#343E5733",
            borderRadius: "4px",
          },
        }}
      />
    </>
  );
};

export default DashboardTable;
