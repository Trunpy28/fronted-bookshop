import React, { useMemo } from "react";
import { Button, ConfigProvider, Table } from "antd";
import Loading from "../LoadingComponent/Loading";
import { FileExcelOutlined } from "@ant-design/icons";
import { Excel } from "antd-table-saveas-excel";

const TableComponent = (props) => {
  const {
    data: dataSource = [],
    isLoading = false,
    columns = [],
  } = props;

  const newColumnExport = useMemo(() => {
    const arr = columns?.filter((column) => column.dataIndex !== "action");
    return arr;
  }, [columns]);

  const exportExcel = () => {  
    const excel = new Excel();
    excel
      .addSheet("Sheet1")
      .addColumns(newColumnExport)
      .addDataSource(dataSource, {
        str2Percent: false,
      })
      .saveAs("Excel.xlsx");
  };

  return (
    <Loading isLoading={isLoading}>
      <Button
        onClick={exportExcel}
        style={{ fontSize: "16px", marginBottom: "20px", height: "40px"}}
      >
        <FileExcelOutlined style={{fontSize: "18px"}}/> Xuất Excel
      </Button>
      <div>
        <ConfigProvider
          theme={{
            components: {
              Table: {
                /* here is your component tokens */
                cellFontSize: "16px",
              },
            },
          }}
        >
          <Table
            columns={columns}
            dataSource={dataSource}
            {...props}
          />
        </ConfigProvider>
      </div>
    </Loading>
  );
};

export default TableComponent;
