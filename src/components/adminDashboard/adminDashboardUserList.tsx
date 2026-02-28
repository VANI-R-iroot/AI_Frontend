import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axiosInstance from "../../utils/baseUrl";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { hasFlag } from "country-flag-icons";
import * as CountryFlags from "country-flag-icons/react/3x2";

type Order = {
  _id?: string;
  id?: string | number;
  gateway: string;
  eventType: string;
  eventId: string;
  payload: any;
  status: string;
  signatureVerified: boolean;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  processedAt?: string;
  // Extracted fields
  orderId?: string;
  userId?: string;
  packageType?: string;
  packageDuration?: string;
  price?: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerCountryCode?: string;
  customerPostalCode?: string;
};

const AdminDashboardOrders = () => {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const navigate = useNavigate();

  const getRowKey = (order: Partial<Order>) => {
    const raw =
      order._id ||
      (order as any).id ||
      order.orderId ||
      order.eventId ||
      (order as any).order_id ||
      "";
    return raw ? String(raw) : "";
  };

  const extractCustomerInfo = (order: Order): Order => {
    const enhanced = { ...order };

    try {
      // PayPal data extraction
      if (order.gateway === "paypal") {
        // Extract order ID
        if (order.payload?.resource?.id) {
          enhanced.orderId = order.payload.resource.id;
        }

        // Extract package info from custom_id
        if (order.payload?.resource?.purchase_units?.[0]?.custom_id) {
          try {
            const customId = JSON.parse(
              order.payload.resource.purchase_units[0].custom_id
            );
            enhanced.packageType = customId.packageType;
            enhanced.packageDuration = customId.packageDuration;
            enhanced.userId = customId.userId;
          } catch (e) {
            console.error("Error parsing custom_id:", e);
          }
        }

        // Extract price and currency
        if (order.payload?.resource?.purchase_units?.[0]?.amount) {
          const amount = order.payload.resource.purchase_units[0].amount;
          enhanced.price = parseFloat(amount.value);
          enhanced.currency = amount.currency_code;
        }

        // Extract payer information
        if (order.payload?.resource?.payer) {
          const payer = order.payload.resource.payer;

          if (payer.name) {
            enhanced.customerName = `${payer.name.given_name || ""} ${
              payer.name.surname || ""
            }`.trim();
          }

          if (payer.email_address) {
            enhanced.customerEmail = payer.email_address;
          }

          if (payer.address?.country_code) {
            enhanced.customerCountryCode = payer.address.country_code;
          }
        }

        // Extract shipping information
        if (order.payload?.resource?.purchase_units?.[0]?.shipping) {
          const shipping = order.payload.resource.purchase_units[0].shipping;

          if (shipping.name?.full_name) {
            enhanced.customerName = shipping.name.full_name;
          }

          if (shipping.address) {
            enhanced.customerAddress = shipping.address.address_line_1;
            enhanced.customerCity = shipping.address.admin_area_2;
            enhanced.customerState = shipping.address.admin_area_1;
            enhanced.customerPostalCode = shipping.address.postal_code;

            if (shipping.address.country_code) {
              enhanced.customerCountryCode = shipping.address.country_code;
            }
          }
        }
      }

      // Stripe data extraction
      if (order.gateway === "stripe") {
        // Extract order/session ID
        if (order.payload?.data?.object?.id) {
          enhanced.orderId = order.payload.data.object.id;
        }

        // Extract metadata (package info, userId)
        if (order.payload?.data?.object?.metadata) {
          const metadata = order.payload.data.object.metadata;
          enhanced.packageType = metadata.packageType;
          enhanced.packageDuration = metadata.packageDuration;
          enhanced.userId =
            metadata.userId || order.payload.data.object.client_reference_id;
        }

        // Extract price and currency
        if (order.payload?.data?.object?.amount_total) {
          enhanced.price = order.payload.data.object.amount_total / 100;
          enhanced.currency = order.payload.data.object.currency?.toUpperCase();
        }

        // Extract customer information
        if (order.payload?.data?.object?.customer_details) {
          const customerDetails = order.payload.data.object.customer_details;

          if (
            customerDetails.email ||
            order.payload.data.object.customer_email
          ) {
            enhanced.customerEmail =
              customerDetails.email || order.payload.data.object.customer_email;
          }

          if (customerDetails.name) {
            enhanced.customerName = customerDetails.name;
          }

          if (customerDetails.address) {
            const address = customerDetails.address;
            enhanced.customerAddress = address.line1;
            enhanced.customerCity = address.city;
            enhanced.customerState = address.state;
            enhanced.customerPostalCode = address.postal_code;
            enhanced.customerCountryCode = address.country;
          }
        }
      }

      // Paystack data extraction
      if (order.gateway === "paystack") {
        const data = order.payload?.data;

        if (data?.id) {
          enhanced.orderId = data.id.toString();
        }

        if (data?.reference) {
          enhanced.orderId = data.reference;
        }

        if (data?.metadata) {
          enhanced.packageType = data.metadata.packageType;
          enhanced.packageDuration = data.metadata.packageDuration;
          enhanced.userId = data.metadata.userId;
        }

        if (data?.amount) {
          enhanced.price = data.amount / 100;
          enhanced.currency = data.currency?.toUpperCase() || "NGN";
        }

        if (data?.customer) {
          const customer = data.customer;

          if (customer.email) {
            enhanced.customerEmail = customer.email;
          }

          if (customer.first_name || customer.last_name) {
            enhanced.customerName = `${customer.first_name || ""} ${
              customer.last_name || ""
            }`.trim();
          }
        }

        if (data?.authorization) {
          const auth = data.authorization;
          if (auth.country_code) {
            enhanced.customerCountryCode = auth.country_code;
          }
        }
      }
    } catch (error) {
      console.error("Error extracting customer info:", error);
    }

    return enhanced;
  };

  const renderCountryFlag = (countryCode: string) => {
    if (!countryCode)
      return <span style={{ fontSize: "12px", color: "#9CA3AF" }}>N/A</span>;

    const code = countryCode.toUpperCase();

    if (!hasFlag(code)) {
      return <span style={{ fontSize: "12px", color: "#9CA3AF" }}>N/A</span>;
    }

    try {
      const FlagComponent = (CountryFlags as any)[code];

      if (!FlagComponent) {
        return <span style={{ fontSize: "12px", color: "#9CA3AF" }}>N/A</span>;
      }

      return (
        <div
          style={{
            width: "24px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={code}
        >
          <FlagComponent style={{ width: "100%", height: "100%" }} />
        </div>
      );
    } catch (error) {
      console.error(`Flag not found for country code: ${code}`, error);
      return <span style={{ fontSize: "12px", color: "#9CA3AF" }}>N/A</span>;
    }
  };

  const fetchOrderList = async () => {
    try {
      const res = await axiosInstance.get("/payments/get-all-order-history");
      const data = res.data.data;
      const enhancedData = data.map(extractCustomerInfo);
      const sortedData = enhancedData.sort((a: Order, b: Order) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      
      setOrderList(sortedData.slice(0, 6));
    } catch (error) {
      console.error("Failed to fetch order list", error);
    }
  };

  useEffect(() => {
    fetchOrderList();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processed":
      case "completed":
      case "approved":
        return "#22c55e";
      case "pending":
        return "#f59e0b";
      case "cancelled":
      case "failed":
        return "#ef4444";
      case "refunded":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const getGatewayColor = (gateway: string) => {
    switch (gateway.toLowerCase()) {
      case "paypal":
        return "#0070ba";
      case "stripe":
        return "#635bff";
      case "paystack":
        return "#00c3f7";
      case "razorpay":
        return "#3395ff";
      default:
        return "#1f2937";
    }
  };

  const columns: GridColDef[] = [
    {
      field: "customerCountryCode",
      headerName: "Country",
      width: 80,
      renderCell: (params) => (
        <div style={{ paddingTop: "15px" }}>
          {renderCountryFlag(params.value)}
        </div>
      ),
    },
    {
      field: "customerName",
      headerName: "Customer",
      width: 140,
      renderCell: (params) => (
        <span style={{ fontSize: "12px" }}>{params.value || "N/A"}</span>
      ),
    },
    {
      field: "orderId",
      headerName: "Order ID",
      width: 140,
      renderCell: (params) => (
        <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
          {params.value && params.value.length > 15
            ? `${params.value.substring(0, 15)}...`
            : params.value || "N/A"}
        </span>
      ),
    },
    {
      field: "gateway",
      headerName: "Gateway",
      width: 100,
      renderCell: (params) => (
        <span
          style={{
            backgroundColor: getGatewayColor(params.value),
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            textTransform: "capitalize",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "packageType",
      headerName: "Package",
      width: 100,
      renderCell: (params) => (
        <span style={{ textTransform: "capitalize", fontSize: "12px" }}>
          {params.value || "N/A"}
        </span>
      ),
    },
    {
      field: "packageDuration",
      headerName: "Duration",
      width: 100,
      renderCell: (params) => (
        <span style={{ textTransform: "capitalize", fontSize: "12px" }}>
          {params.value || "N/A"}
        </span>
      ),
    },
    {
      field: "price",
      headerName: "Amount",
      width: 100,
      renderCell: (params) => (
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>
          {params.value
            ? `$${params.value} ${params.row.currency || "USD"}`
            : "N/A"}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <span
          style={{
            backgroundColor: getStatusColor(params.value),
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            textTransform: "capitalize",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 100,
      renderCell: (params) => (
        <span style={{ fontSize: "12px" }}>
          {params.value && !Number.isNaN(new Date(params.value).getTime())
            ? format(new Date(params.value), "MM/dd/yy")
            : "N/A"}
        </span>
      ),
    },
  ];

  return (
    <div className="admin-dashboard-orders-section">
     <div className="purchase-plan-header">
        <h2>Recent Purchase Plan</h2>{" "}
        <button
          onClick={() => navigate("/admin-orders")}
          className="see-more-btn"
        >
          View All <span>&gt;</span>
        </button>
      </div>

      <div style={{ width: "100%" }}>
        <DataGrid
          rows={orderList}
          columns={columns}
          getRowId={(row) => getRowKey(row)}
          hideFooter={true}
          disableRowSelectionOnClick
          sx={{
            backgroundColor: "#343e5733",
            color: "#E2E8F0",
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#1e293b !important",
              color: "#E2E8F0",
              borderBottom: "1px solid rgba(8, 9, 10, 0.2)",
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#1e293b !important",
            },
            "& .MuiDataGrid-filler": {
              backgroundColor: "#1e293b !important",
            },
            "& .MuiDataGrid-scrollbar--horizontal": {
              backgroundColor: "#1e293b !important",
            },
            "& .MuiDataGrid-columnHeadersInner": {
              backgroundColor: "#1e293b !important",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              color: "#E2E8F0",
            },
            "& .MuiDataGrid-row": {
              backgroundColor: "rgba(52, 62, 87, 0)",
              "&:hover": {
                backgroundColor: "rgba(52, 62, 87, 0.5) !important",
              },
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(52, 62, 87, 0.5) !important",
            },
            "& .MuiDataGrid-row.Mui-hovered": {
              backgroundColor: "rgba(52, 62, 87, 0.5) !important",
            },
            "& .MuiDataGrid-row.Mui-selected": {
              backgroundColor: "rgba(52, 62, 87, 0.5) !important",
              "&:hover": {
                backgroundColor: "rgba(52, 62, 87, 0.7) !important",
              },
            },
            "& .MuiDataGrid-row.Mui-selected.Mui-hovered": {
              backgroundColor: "rgba(52, 62, 87, 0.7) !important",
            },
            "& .MuiDataGrid-cell": {
              color: "#E2E8F0",
              borderColor: "rgba(71, 85, 105, 0.33)",
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-cell.Mui-selected": {
              backgroundColor: "transparent !important",
            },
            "& .MuiDataGrid-cell--withRenderer.Mui-selected": {
              backgroundColor: "transparent !important",
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
      </div>
    </div>
  );
};

export default AdminDashboardOrders;

