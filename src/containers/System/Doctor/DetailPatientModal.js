import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import LoadingOverlay from 'react-loading-overlay'
import { toast } from 'react-toastify'
import moment from 'moment'
import './DetailPatientModal.scss'
import { CommonUtils, LANGUAGES } from '../../../utils'
import { UpdateDetailPatient, getDetailPatientById } from '../../../services/userService'
import _ from 'lodash'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css'
const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250
        }
    }
}

const names = ['Xét nghiệm máu', 'Siêu âm', 'Chụp X quang', 'Xét nghiệm nước tiểu', 'Nội soi']

class DetailPatientModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false,
            previewImgURL: '',
            reason: '',
            statusUpdate: '',
            patientRecords: '',
            testName: [],
            patientName: '',
            dataPatient: {},
            isShowLoading: false,
            doctorRequestPending: '',
            doctorRequestDone: '',
            history: [],
            selectDayExamination: '',
            selectedHistoryItem: null
        }
    }

    async componentDidMount() {
        let { dataModal } = this.props
        let data = await this.getInforPatient(dataModal.patientId)
        const [doctorRequestArrayDisplay, doctorRequestPending, doctorRequestDone] = this.checkDoctorRequestAndDisplay(
            data.doctorRequest
        )

        if (this.props.dataModal) {
            this.setState({
                dataPatient: data,
                history: data.Histories ? data.Histories : {},
                patientName: dataModal.patientName,
                statusUpdate: data.statusUpdate,
                testName: doctorRequestArrayDisplay,
                doctorRequestPending: doctorRequestPending,
                doctorRequestDone: doctorRequestDone
            })
        }
    }

    async componentDidUpdate(prevProps, prevState, snapShot) {
        if (this.state.dataPatient.Histories !== prevState.dataPatient.Histories) {
            if (this.state.dataPatient.Histories && !_.isEmpty(this.state.dataPatient.Histories)) {
                const { dataPatient } = this.state
                this.setState({
                    history: dataPatient.Histories
                })
            }
        }
        if (this.props.dataModal.patientId !== prevProps.dataModal.patientId) {
            this.setState({
                patientName: this.props.dataModal.patientName
            })
            let data = await this.getInforPatient(this.props.dataModal.patientId)
            const [doctorRequestArrayDisplay, doctorRequestPending, doctorRequestDone] =
                this.checkDoctorRequestAndDisplay(data.doctorRequest)

            this.setState({
                dataPatient: data,
                statusUpdate: data.statusUpdate,
                testName: doctorRequestArrayDisplay,
                doctorRequestPending: doctorRequestPending,
                doctorRequestDone: doctorRequestDone,
                selectDayExamination: '',
                selectedHistoryItem: null,
                history: []
            })
        }
    }

    checkDoctorRequestAndDisplay = (doctorRequest) => {
        let doctorRequestArray = []
        // kiểm tra đển trùng dữ liệu của doctorRequest
        if (typeof doctorRequest === 'string') {
            doctorRequestArray = JSON.parse(doctorRequest)
        } else if (Array.isArray(doctorRequest)) {
            doctorRequestArray = doctorRequest
        }
        // Lọc các phần tử có "-F"
        let doctorRequestPending = doctorRequestArray
            .filter((item) => item.includes('-F'))
            .map((item) => item.replace('-F', ''))
        // Lọc các phần tử có "-T"
        let doctorRequestDone = doctorRequestArray
            .filter((item) => item.includes('-T'))
            .map((item) => item.replace('-T', ''))
        // loại bỏ "-F" để hiển thị (F chưa xác nhận)
        let doctorRequestArrayDisplay = doctorRequestArray
            .filter((item) => item.includes('-F'))
            .map((item) => item.replace('-F', ''))
        return [doctorRequestArrayDisplay, doctorRequestPending, doctorRequestDone]
    }

    getInforPatient = async (id) => {
        let result = {}
        if (id) {
            let res = await getDetailPatientById(id)
            if (res && res.errCode === 0) {
                result = res.data
            }
        }
        return result
    }

    handleOnChangeEmail = (event) => {
        this.setState({
            name: event.target.value
        })
    }

    getStyles(name, testName, theme) {
        return {
            fontWeight: testName.indexOf(name) === -1 ? 'bold' : 'normal'
        }
    }

    handleOnChangeImage = async (event) => {
        let data = event.target.files
        let file = data[0]
        if (file) {
            let base64 = await CommonUtils.getBase64(file)
            this.setState({
                imageBase64: base64
            })
        }
    }

    handleChange = (event) => {
        const {
            target: { value }
        } = event
        this.setState({
            testName: typeof value === 'string' ? value.split(',') : value
        })
    }

    handleOnChangeText = (event, id) => {
        let stateCopy = { ...this.state }
        stateCopy[id] = event.target.value
        this.setState({
            ...stateCopy
        })
    }

    handleUpdateDetailPatient = async () => {
        let { dataPatient } = this.state
        this.props.getDataToManagePatient(this.state.statusUpdate)
        this.setState({ isShowLoading: true })
        let res = await UpdateDetailPatient({
            patientId: dataPatient.patientId,
            reason: this.state.reason,
            statusUpdate: this.state.statusUpdate,
            doctorRequest: this.state.testName
        })
        if (res && res.errCode === 0) {
            this.setState({ isShowLoading: false })
            toast.success('Cập nhật bệnh nhân thành công!')
            this.props.closeDetailModal()
        } else {
            this.setState({ isShowLoading: false })
            toast.error('Cập nhật bệnh nhân thất bại!')
        }
    }

    openPreviewImage = () => {
        if (!this.state.selectedHistoryItem.files) return

        this.setState({
            isOpen: true
        })
    }

    handleChangeExamination = (event) => {
        const selectedDate = event.target.value
        const selectedHistoryItem = this.state.history.find(
            (item) => moment(item.createdAt).format('DD/MM/YYYY') === selectedDate
        )
        this.setState({
            selectDayExamination: selectedDate,
            selectedHistoryItem: selectedHistoryItem
        })
    }

    render() {
        const { isOpenModal, closeDetailModal, language, dataModal } = this.props
        const {
            testName,
            patientName,
            history,
            statusUpdate,
            dataPatient,
            doctorRequestPending,
            doctorRequestDone,
            selectDayExamination,
            selectedHistoryItem
        } = this.state

        const gender =
            language === LANGUAGES.VI
                ? dataModal?.genderData?.valueVi ?? 'Giới tính mặc định'
                : dataModal?.genderData?.valueEn ?? 'Default Gender'
        // Định dạng ngày tháng
        const birthday = moment(Number(dataPatient.birthday)).format('DD/MM/YYYY')

        const dayExamination = Array.isArray(history)
            ? history
                  .map((item) => (item?.createdAt ? moment(item.createdAt) : null))
                  .filter(Boolean)
                  .sort((a, b) => b - a) // Sắp xếp từ mới nhất đến cũ nhất
                  .map((date) => date.format('DD/MM/YYYY'))
            : []

        return (
            <>
                <LoadingOverlay active={this.state.isShowLoading} spinner text='Loading...'>
                    <Modal isOpen={isOpenModal} className='booking-modal-container' size='lg' centered>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Chi tiết bệnh nhân</h5>
                            <button type='button' className='close' aria-label='Close' onClick={closeDetailModal}>
                                <span aria-hidden='true'>x</span>
                            </button>
                        </div>
                        <ModalBody>
                            <div className='row'>
                                <div className='col-6 mb-2'>
                                    <label className='font-weight-bold'>Bệnh nhân: </label>
                                    <span> {patientName}</span>
                                </div>
                                <div className='col-6 mb-2'></div>
                                <div className='col-4'>
                                    <label className='font-weight-bold'>Năm sinh: </label>
                                    <span> {birthday}</span>
                                </div>
                                <div className='col-4'>
                                    <label className='font-weight-bold'>Giới tính: </label>
                                    <span> {gender}</span>
                                </div>
                                <div className='col-4'>
                                    <label className='font-weight-bold'>SĐT: </label>
                                    <span> {dataModal.phonenumber}</span>
                                </div>
                                {dataPatient.height && (
                                    <div className='col-4'>
                                        <label className='font-weight-bold'>Chiều cao: </label>
                                        <span> {dataPatient.height}</span>
                                    </div>
                                )}
                                {dataPatient.weight && (
                                    <div className='col-4'>
                                        <label className='font-weight-bold'>Cân nặng: </label>
                                        <span> {dataPatient.weight}</span>
                                    </div>
                                )}
                                {dataPatient.bloodGroup && (
                                    <div className='col-4'>
                                        <label className='font-weight-bold'>Nhóm máu: </label>
                                        <span> {dataPatient.bloodGroup}</span>
                                    </div>
                                )}
                                {dataPatient.bloodPressure && (
                                    <div className='col-4'>
                                        <label className='font-weight-bold'>Huyết áp: </label>
                                        <span> {dataPatient.bloodPressure}</span>
                                    </div>
                                )}
                                {dataPatient.temperature && (
                                    <div className='col-4'>
                                        <label className='font-weight-bold'>Thân nhiệt: </label>
                                        <span> {dataPatient.temperature}</span>
                                    </div>
                                )}

                                {dataPatient.reason && (
                                    <div className='col-12'>
                                        <label className='font-weight-bold'>Triệu chứng: </label>
                                        <span> {dataPatient.reason}</span>
                                    </div>
                                )}
                                <div className='col-12 mt-2'>
                                    <FormControl className='day-examination'>
                                        <InputLabel id='demo-simple-select-label'>Lịch sử khám</InputLabel>
                                        <Select
                                            labelId='demo-simple-select-label'
                                            id='demo-simple-select'
                                            value={selectDayExamination}
                                            label='Lịch sử khám'
                                            onChange={this.handleChangeExamination}
                                        >
                                            {dayExamination.map((item, index) => (
                                                <MenuItem key={index} value={item}>
                                                    {item}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>

                                <div className='col-6 mt-4'>
                                    <div className='form-group'>
                                        <label>Bệnh án</label>
                                        <textarea
                                            disabled
                                            className='form-control'
                                            rows='4'
                                            value={selectedHistoryItem?.description}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className='col-6 mt-4'>
                                    <label>Đơn thuốc khám lần trước</label>
                                    <div
                                        className='preview-image'
                                        style={{
                                            backgroundImage: `url(${selectedHistoryItem?.files})`
                                        }}
                                        onClick={() => this.openPreviewImage()}
                                    ></div>
                                </div>

                                <div className='col-6 mt-4'>
                                    <div className='form-group'>
                                        <label>Cập nhật tình trạng bệnh nhân</label>
                                        <textarea
                                            className='form-control'
                                            rows='4'
                                            onChange={(event) => this.handleOnChangeText(event, 'statusUpdate')}
                                            value={statusUpdate}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className='col-6 mt-4'>
                                    <div className='form-group'>
                                        <label>Yêu cầu của bác sĩ</label>
                                        <FormControl sx={{ width: 300 }}>
                                            <InputLabel id='demo-multiple-chip-label'>Yêu cầu</InputLabel>
                                            <Select
                                                labelId='demo-multiple-chip-label'
                                                id='demo-multiple-chip'
                                                multiple
                                                disabled={dataModal && dataModal.statusId === 'S2'}
                                                value={testName}
                                                onChange={this.handleChange}
                                                input={<OutlinedInput id='select-multiple-chip' label='Yêu cầu' />}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => (
                                                            <Chip key={value} label={value} />
                                                        ))}
                                                    </Box>
                                                )}
                                                MenuProps={MenuProps}
                                            >
                                                {names.map((name) => (
                                                    <MenuItem
                                                        key={name}
                                                        value={name}
                                                        style={{
                                                            fontWeight:
                                                                testName.indexOf(name) === -1 ? 'normal' : 'bold'
                                                        }}
                                                    >
                                                        {name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className='d-flex flex-column'>
                                        <div className='d-flex flex-column'>
                                            <label className='bg-update'>Chờ duyệt</label>
                                            <div className='ml-4'>
                                                {doctorRequestPending && doctorRequestPending.length > 0 ? (
                                                    doctorRequestPending.map((item, index) => (
                                                        <span key={index}>
                                                            {item}
                                                            {index !== doctorRequestPending.length - 1 && ' - '}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span>Chưa có yêu cầu</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className='d-flex flex-column mt-2'>
                                            <label className='bg-create'>Hoàn thành</label>
                                            <div className='ml-4'>
                                                {doctorRequestDone && doctorRequestDone.length > 0 ? (
                                                    doctorRequestDone.map((item, index) => (
                                                        <span key={index}>
                                                            {item}
                                                            {index !== doctorRequestDone.length - 1 && ' - '}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span>Đang chờ duyệt</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color='warning'
                                disabled={dataModal && dataModal.statusId === 'S2'}
                                onClick={() => this.handleUpdateDetailPatient()}
                            >
                                Cập nhật
                            </Button>{' '}
                            <Button color='secondary' onClick={closeDetailModal}>
                                Huỷ
                            </Button>
                        </ModalFooter>
                    </Modal>
                </LoadingOverlay>
                {this.state.isOpen === true && (
                    <Lightbox
                        mainSrc={selectedHistoryItem.files}
                        onCloseRequest={() => this.setState({ isOpen: false })}
                    />
                )}
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        language: state.app.language,
        genders: state.admin.genders
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailPatientModal)
