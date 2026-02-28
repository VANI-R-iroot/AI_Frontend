import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ShortLink from "../../common/ShortLinkDashboard";
import { AiFillDelete } from "react-icons/ai";
import axiosInstance from "../../utils/baseUrl";
import { format } from "date-fns";
import { FaSearch } from "react-icons/fa";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import PageLoader from "../../common/loader";
import { hasFlag } from "country-flag-icons";
import * as CountryFlags from "country-flag-icons/react/3x2";

type Order = {
  _id: string;
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
  customerPhone?: string;
};

const OrderPages = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [orderList, setOrderList] = useState<Order[]>([]);

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

          // Customer email
          if (
            customerDetails.email ||
            order.payload.data.object.customer_email
          ) {
            enhanced.customerEmail =
              customerDetails.email || order.payload.data.object.customer_email;
          }

          // Customer name
          if (customerDetails.name) {
            enhanced.customerName = customerDetails.name;
          }

          // Customer address
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

        // Extract order/transaction ID
        if (data?.id) {
          enhanced.orderId = data.id.toString();
        }

        // Extract reference
        if (data?.reference) {
          enhanced.orderId = data.reference; // Use reference as primary order ID
        }

        // Extract metadata (package info, userId)
        if (data?.metadata) {
          enhanced.packageType = data.metadata.packageType;
          enhanced.packageDuration = data.metadata.packageDuration;
          enhanced.userId = data.metadata.userId;
        }

        // Extract price and currency
        if (data?.amount) {
          // Paystack amount is in kobo (smallest currency unit), convert to main unit
          enhanced.price = data.amount / 100;
          enhanced.currency = data.currency?.toUpperCase() || "NGN";
        }

        // Extract customer information
        if (data?.customer) {
          const customer = data.customer;

          // Customer email
          if (customer.email) {
            enhanced.customerEmail = customer.email;
          }

          // Customer name
          if (customer.first_name || customer.last_name) {
            enhanced.customerName = `${customer.first_name || ""} ${
              customer.last_name || ""
            }`.trim();
          }

          // Customer phone
          if (customer.phone) {
            enhanced.customerPhone = customer.phone;
          }
        }

        // Extract authorization info (card details if available)
        if (data?.authorization) {
          const auth = data.authorization;
          // Country code from authorization
          if (auth.country_code) {
            enhanced.customerCountryCode = auth.country_code;
          }
        }
      }

      // Razorpay data extraction
      if (order.gateway === "razorpay") {
        const data = order.payload?.data;

        // Extract payment ID
        if (data?.id) {
          enhanced.orderId = data.id;
        }

        // Extract order ID
        if (data?.order_id) {
          enhanced.orderId = data.order_id; // Use order_id as primary identifier
        }

        // Extract notes (metadata - package info, userId)
        if (data?.notes) {
          enhanced.packageType = data.notes.packageType;
          enhanced.packageDuration = data.notes.packageDuration;
          enhanced.userId = data.notes.userId;
        }

        // Extract price and currency
        if (data?.amount) {
          // Razorpay amount is in paise (smallest currency unit), convert to main unit
          enhanced.price = data.amount / 100;
          enhanced.currency = data.currency?.toUpperCase() || "INR";
        }

        // Extract customer information
        if (data?.email) {
          enhanced.customerEmail = data.email;
        }

        if (data?.contact) {
          enhanced.customerPhone = data.contact;
        }

        // Extract customer name from card name if available
        if (data?.card?.name) {
          // Check if it's not a card number pattern
          const cardName = data.card.name;
          if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(cardName)) {
            enhanced.customerName = cardName;
          }
        }

        // Try to determine country from card network (international flag)
        if (data?.card?.network && data?.international) {
          // If international is true, it's not an Indian card
          // We can't determine exact country, but we know it's not IN
          if (!data.international) {
            enhanced.customerCountryCode = "IN"; // Domestic Indian card
          }
        }

        // If not international and currency is INR, assume India
        if (
          !enhanced.customerCountryCode &&
          data?.currency?.toUpperCase() === "INR" &&
          !data?.international
        ) {
          enhanced.customerCountryCode = "IN";
        }

        // Extract description (might contain useful info)
        if (data?.description) {
          // Description is available but typically contains plan info
          // Already extracted from notes
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
            cursor: "pointer",
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

  // Fetch order list
  const fetchOrderList = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("/payments/get-all-order-history");
      const data = res.data.data;

      const enhancedData = data.map(extractCustomerInfo);
      const sortedData = enhancedData.sort((a: Order, b: Order) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setOrderList(sortedData);
    } catch (error) {
      console.error("Failed to fetch order list", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderList();
  }, []);

  useEffect(() => {
    if (searchKeyWord.trim()) {
      const delayDebounce = setTimeout(() => {
        fetchOrderList();
      }, 500);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchKeyWord]);

  const handleDeleteOrder = (id: string) => {
    setSelectedOrderId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrderId) return;

    try {
      const res = await axiosInstance.delete(
        `/payments/delete-order/${selectedOrderId}`
      );
      if (res.status === 200) {
        const updatedList = orderList.filter(
          (item) => item._id !== selectedOrderId
        );
        setOrderList(updatedList);
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedOrderId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedOrderId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processed":
      case "completed":
      case "approved":
      case "captured":
      case "authorized":
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
      headerName: "Customer Name",
      width: 130,
      renderCell: (params) => (
        <span style={{ fontSize: "12px" }}>{params.value || "N/A"}</span>
      ),
    },
    {
      field: "orderId",
      headerName: "Order ID",
      width: 130,
      renderCell: (params) => (
        <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
          {params.value || "N/A"}
        </span>
      ),
    },
    {
      field: "customerEmail",
      headerName: "Email",
      width: 150,
      renderCell: (params) => (
        <span style={{ fontSize: "12px" }}>{params.value || "N/A"}</span>
      ),
    },
    {
      field: "customerPhone",
      headerName: "Phone",
      width: 120,
      renderCell: (params) => (
        <span style={{ fontSize: "12px" }}>{params.value || "N/A"}</span>
      ),
    },
    {
      field: "customerAddress",
      headerName: "Address",
      width: 140,
      renderCell: (params) => (
        <span style={{ fontSize: "12px" }}>
          {params.value
            ? `${params.value}, ${params.row.customerCity || ""}, ${
                params.row.customerState || ""
              } ${params.row.customerPostalCode || ""}`.trim()
            : "N/A"}
        </span>
      ),
    },
    {
      field: "gateway",
      headerName: "Gateway",
      width: 100,
      renderCell: (params) => {
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

        return (
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
        );
      },
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
        <span style={{ fontSize: "12px", textTransform: "capitalize" }}>
          {params.value || "N/A"}
        </span>
      ),
    },
    {
      field: "price",
      headerName: "Amount",
      width: 120,
      renderCell: (params) => (
        <span style={{ fontWeight: "bold", fontSize: "12px" }}>
          {params.value
            ? `${params.row.currency || "USD"} ${params.value.toFixed(2)}`
            : "N/A"}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
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
      width: 130,
      renderCell: (params) => (
        <span style={{ fontSize: "12px" }}>
          {format(new Date(params.value), "MM/dd/yy hh:mm a")}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      renderCell: (params) => (
        <div className="table-acton-button">
          <AiFillDelete
            size={20}
            color="red"
            title="Delete Order"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteOrder(params.row._id)}
          />
        </div>
      ),
    },
  ];

  // Filter orders
  const filteredOrders = orderList.filter((order) => {
    const searchTerm = searchKeyWord.toLowerCase();
    return (
      (order.orderId && order.orderId.toLowerCase().includes(searchTerm)) ||
      (order.userId && order.userId.toLowerCase().includes(searchTerm)) ||
      (order.packageType &&
        order.packageType.toLowerCase().includes(searchTerm)) ||
      order.gateway.toLowerCase().includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm) ||
      (order.price && order.price.toString().includes(searchTerm)) ||
      (order.customerName &&
        order.customerName.toLowerCase().includes(searchTerm)) ||
      (order.customerEmail &&
        order.customerEmail.toLowerCase().includes(searchTerm)) ||
      (order.customerPhone &&
        order.customerPhone.toLowerCase().includes(searchTerm)) ||
      (order.customerCity &&
        order.customerCity.toLowerCase().includes(searchTerm)) ||
      (order.customerPostalCode &&
        order.customerPostalCode.toLowerCase().includes(searchTerm)) ||
      (order.customerAddress &&
        order.customerAddress.toLowerCase().includes(searchTerm))
    );
  });

  return (
    <>
      <div className="main-content-common">
        <div className="container-flute">
          <div className="global-link-limit-section">
            <div className="short-link-text">
              <ShortLink />
            </div>
            <div className="admin-dashboard-search-field-smart-ai">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchKeyWord}
                  onChange={(e) => setSearchKeyWord(e.target.value)}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <button
                  onClick={fetchOrderList}
                  disabled={isLoading}
                  style={{
                    backgroundColor: "#22c55e",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "4px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                  }}
                >
                  {isLoading ? "Loading..." : "🔄 Refresh Orders"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(52, 62, 87, 0.3)",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(71, 85, 105, 0.33)",
            }}
          >
            <div style={{ color: "#E2E8F0", fontSize: "14px" }}>
              Total Orders
            </div>
            <div
              style={{ color: "#E2E8F0", fontSize: "20px", fontWeight: "bold" }}
            >
              {filteredOrders.length}
            </div>
          </div>
          <div
            style={{
              backgroundColor: "rgba(52, 62, 87, 0.3)",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(71, 85, 105, 0.33)",
            }}
          >
            <div style={{ color: "#E2E8F0", fontSize: "14px" }}>
              Pending Orders
            </div>
            <div
              style={{ color: "#f59e0b", fontSize: "20px", fontWeight: "bold" }}
            >
              {
                filteredOrders.filter((order) => order.status === "pending")
                  .length
              }
            </div>
          </div>
          <div
            style={{
              backgroundColor: "rgba(52, 62, 87, 0.3)",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(71, 85, 105, 0.33)",
            }}
          >
            <div style={{ color: "#E2E8F0", fontSize: "14px" }}>
              Total Revenue
            </div>
            <div
              style={{ color: "#22c55e", fontSize: "20px", fontWeight: "bold" }}
            >
              $
              {filteredOrders
                .reduce((sum, order) => sum + (order.price || 0), 0)
                .toFixed(2)}
            </div>
          </div>
          <div
            style={{
              backgroundColor: "rgba(52, 62, 87, 0.3)",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(71, 85, 105, 0.33)",
            }}
          >
            <div style={{ color: "#E2E8F0", fontSize: "14px" }}>
              Unique Customers
            </div>
            <div
              style={{ color: "#3b82f6", fontSize: "20px", fontWeight: "bold" }}
            >
              {
                new Set(
                  filteredOrders
                    .map((order) => order.customerEmail)
                    .filter(Boolean)
                ).size
              }
            </div>
          </div>
        </div>

        <div className="admin-table-section-smart-ai">
          <PageLoader isLoading={isLoading} />
          <div className="">
            <DataGrid
              rows={filteredOrders}
              columns={columns}
              getRowId={(row) => row._id}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              checkboxSelection
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
      </div>
      <DeleteConfirmModel
        isOpen={showDeleteModal}
        title="Delete Order?"
        message="Are you sure you want to remove this order permanently? This action cannot be undone."
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default OrderPages;
