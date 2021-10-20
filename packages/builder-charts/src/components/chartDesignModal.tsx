import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Modal, Button, Form } from 'antd';
import { ChartDesign, ChartDesignProps, CHART_OBJECT_APINAME } from './chartDesign'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { API, Objects } from '@steedos-ui/builder-store';
import { isEmpty } from 'lodash';
import './chartDesignModal.less';
export const ChartDesignModal = observer((props: ChartDesignProps) => {
  const { chartId } = props;
  const [visible, setVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [editOptions, setEditOptions] = React.useState({});
  const [form] = Form.useForm();
  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    form.validateFields()
          .then(values => {
            // form.resetFields();
            // onCreate(values);
            let record: any = {type: values.type, label: values.label};
            if(!isEmpty(editOptions)){
              record.options = editOptions
            }
            API.updateRecord(CHART_OBJECT_APINAME, chartId, record).then((value)=>{
              closeModal();
              setConfirmLoading(false);
              Objects.getObject(CHART_OBJECT_APINAME).getRecord(record._id, []).loadRecord();
            }).catch(info => {
              setConfirmLoading(false);
            });
          })
          .catch(info => {
            setConfirmLoading(false);
          });
  };

  function closeModal() {
    setVisible(false);
  }

  const handleCancel = () => {
    Modal.confirm({
      title: '可视化编辑器',
      icon: <ExclamationCircleOutlined />,
      content: '您确定要关闭编辑器而不保存吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: closeModal
    });
  };

  return (
    <>
      <Button onClick={showModal} id="chartDesignModalBtn">
        打开设计器
      </Button>
      <Modal
      title="可视化编辑器"
      visible={visible}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      wrapClassName="ant-modal-fullscreen"
      width="98%"
      destroyOnClose={true}
    >
      <ChartDesign chartId={chartId} form={form} onEditOptionsChange={setEditOptions}></ChartDesign>
    </Modal>
    </>
    
  );
})