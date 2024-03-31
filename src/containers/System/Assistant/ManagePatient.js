import React, { Component } from 'react';
import { connect } from "react-redux";
import {  FormattedMessage } from 'react-intl';
import './ManagePatient.scss';
import "datatables.net-dt/js/dataTables.dataTables"
import "datatables.net-dt/css/jquery.dataTables.min.css"
import $ from 'jquery';
import DatePicker from '../../../components/Input/DatePicker';
import {TSPT4,TSPT3, getListPatient, postSendRemedy } from '../../../services/userService';
import moment from 'moment';
import { LANGUAGES } from '../../../utils';
import RemedyModal from './RemedyModal';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import CloseStateOfPatient from '../../Mui Dialog/closeStateOfPatient'
class ManagePatient extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentDate: moment(new Date()).startOf('day').valueOf(),
            dataPatient: [],
            isOpenRemedyModal: false,
            dataModal: {},
            isShowLoading: false,
            isDialogOpen: false,
            idToDelete: null,
        }
    }

    async componentDidMount() {
        this.getDataPatient();

        //initialize datatable
        $(document).ready(function () {
            setTimeout(function () {
                $('#myTable').DataTable();
            }, 1000);
        });
    }

    getDataPatient = async () => {
        let { currentDate } = this.state;
        let formattedDate = new Date(currentDate).getTime();
        let res = await getListPatient({
            date: formattedDate
        })
        if (res && res.errCode === 0) {
            this.setState({
                dataPatient: res.data
            })
        }
    }

    async componentDidUpdate(prevProps, prevState, snapShot) {
        this.getDataPatient();
    }

    handleOnChangeDatePicker = (date) => {
        console.log(date)
        this.setState({
            currentDate: date[0]
        }, async () => {
            await this.getDataPatient();
        })
    }

    handleBtnConfirm = async (id) => {
        let result= await TSPT3({id:id});
        if(result)
        {
            toast.success("Xác nhận thay đổi trạng thái thành công");
        }
       
    }
    handleBtnDelete = async (id) => {
        let result= await TSPT4({id:id});
        if(result)
        {
            toast.success("Đã xóa thành công");
        }
    }

    handleOpenDialog = (id) => {
        this.setState(prevState => ({ isDialogOpen: true, idToDelete: id }));

    };


    handleCloseDialog = () => {
        this.setState({ isDialogOpen: false, idToDelete: null });
    };

    handleConfirmDelete = () => {
        // Call your deletion action here with this.state.idToDelete
        // For example: this.props.handleDelete(this.state.idToDelete);
        // Reset state after deletion
        this.setState({ isDialogOpen: false, idToDelete: null });
        
    };
    closeRemedyModal = () => {
        this.setState({
            isOpenRemedyModal: false,
            dataModal: {}
        })
    }
    
    sendRemedy = async (dataChild) => {
        let { dataModal } = this.state;
        this.setState({
            isShowLoading: true
        })
        let res = await postSendRemedy({
            email: dataChild.email,
            imgBase64: dataChild.imageBase64,
            doctorId: dataModal.doctorId,
            patientId: dataModal.patientId,
            timeType: dataModal.timeType,
            language: this.props.language,
            patientName: dataModal.patientName
        });
        if (res && res.errCode === 0) {
            this.setState({
                isShowLoading: false
            })
            toast.success('Send Remedy succeeds')
            this.closeRemedyModal();
            await this.getDataPatient();
        } else {
            this.setState({
                isShowLoading: false
            })
            toast.error('Send Remedy error')
            console.log('Send Remedy error', res)
        }
    }

    render() {
        let { dataPatient, isOpenRemedyModal, dataModal } = this.state;
        let { language } = this.props;
        return (
            <>
                <LoadingOverlay
                    active={this.state.isShowLoading}
                    spinner
                    text='Loading...'
                >
                    <div className="manage-patient-container">
                        <div className='m-p-title'>
                            <FormattedMessage id='manage-patient.title' />
                        </div>

                        <div className='manage-patient-body row'>
                            <div className='col-4 form-group'>
                                <label>Chọn ngày khám</label>
                                <DatePicker
                                    onChange={this.handleOnChangeDatePicker}
                                    className='form-control'
                                    value={this.state.currentDate}
                                />
                            </div>
                            <div className='col-12'>
                                <div className="card shadow mb-4 bg-light" >
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table id='myTable' className='display'>
                                                <thead className='tbl-header'>
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>Thời gian</th>
                                                        <th>Họ và tên</th>
                                                        <th>Địa chỉ</th>
                                                        <th>Giới tính</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dataPatient && dataPatient.length > 0 &&
                                                        dataPatient.map((item, index) => {
                                                            let time = language === LANGUAGES.VI ?
                                                                item.timeTypeDataPatient.valueVi : item.timeTypeDataPatient.valueEn;
                                                            let gender = language === LANGUAGES.VI ?
                                                                item.patientData.genderData.valueVi : item.patientData.genderData.valueEn;
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{time}</td>
                                                                    <td>{item.patientData.firstName}</td>
                                                                    <td>{item.patientData.address}</td>
                                                                    <td>{gender}</td>
                                                                    <td className='btn-action'>
                                                                        <button className='mp-btn-confirm btn btn-warning'
                                                                            onClick={() => this.handleBtnConfirm(item.id)}>Xác nhận
                                                                        </button>
                                                                        <button className='mp-btn-close btn btn-red' onClick={() => this.handleOpenDialog(item.id)}>Hủy bỏ</button>
                                                                     
                                                                    </td>

                                                                </tr>
                                                            )
                                                        })
                                                        // :
                                                        // <tr>
                                                        //     no data
                                                        // </tr>
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CloseStateOfPatient 
                        open={this.state.isDialogOpen} 
                        handleClose={this.handleCloseDialog} 
                        handleConfirmDelete={this.handleConfirmDelete} 
                        idToDelete={this.state.idToDelete}
                        handleBtnDelete={this.handleBtnDelete}
                    />

                    <RemedyModal
                        isOpenModal={isOpenRemedyModal}
                        dataModal={dataModal}
                        closeRemedyModal={this.closeRemedyModal}
                        sendRemedy={this.sendRemedy}
                    />
                </LoadingOverlay>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        user: state.user.userInfo,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManagePatient);