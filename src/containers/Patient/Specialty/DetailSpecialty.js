import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import HomeHeader from '../../HomePage/HomeHeader'
import DoctorSchedule from '../Doctor/DoctorSchedule'
import DoctorExtraInfor from '../Doctor/DoctorExtraInfor'
import ProfileDoctor from '../Doctor/ProfileDoctor'
import { getDetailSpecialtyById, getAllCodeService } from '../../../services/userService'
import './DetailSpecialty.scss'
import { LANGUAGES } from '../../../utils'

class DetailSpecialty extends Component {
    constructor(props) {
        super(props)
        this.state = {
            arrDoctorId: [],
            dataDetailSpecialty: {},
            listProvice: []
        }
    }

    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id

            let res = await getDetailSpecialtyById({
                id: id,
                location: 'ALL'
            })

            let resProvince = await getAllCodeService('PROVINCE')

            if (res && res.errCode === 0 && resProvince && resProvince.errCode === 0) {
                let data = res.data
                let arrDoctorId = []
                if (data && !_.isEmpty(res.data)) {
                    let arr = data.doctorSpecialty
                    if (arr && arr.length > 0) {
                        arr.map((item) => {
                            arrDoctorId.push(item.doctorId)
                            return null
                        })
                    }
                }

                let dataProvince = resProvince.data
                if (dataProvince && dataProvince.length > 0) {
                    dataProvince.unshift({
                        createdAt: null,
                        key: 'ALL',
                        type: 'PROVINCE',
                        valueEn: 'ALL',
                        valueVi: 'Toàn quốc'
                    })
                }

                this.setState({
                    dataDetailSpecialty: res.data,
                    arrDoctorId: arrDoctorId,
                    listProvice: dataProvince ? dataProvince : []
                })
            }
        }
    }

    async componentDidUpdate(prevProps, prevState, snapShot) {
        if (this.props.language !== prevProps.language) {
        }
    }

    handleOnChangeSelect = async (event) => {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id
            let location = event.target.value

            let res = await getDetailSpecialtyById({
                id: id,
                location: location
            })

            if (res && res.errCode === 0) {
                let data = res.data
                let arrDoctorId = []
                if (data && !_.isEmpty(res.data)) {
                    let arr = data.doctorSpecialty
                    if (arr && arr.length > 0) {
                        arr.map((item) => {
                            arrDoctorId.push(item.doctorId)
                            return null
                        })
                    }
                }

                this.setState({
                    dataDetailSpecialty: res.data,
                    arrDoctorId: arrDoctorId
                })
            }
        }
    }

    render() {
        let { arrDoctorId, dataDetailSpecialty, listProvice } = this.state
        let { language } = this.props
        return (
            <div className='detail-specialty-container'>
                <HomeHeader />
                <div className='detail-specialty-body'>
                    <div className='description-specialty'>
                        {dataDetailSpecialty && !_.isEmpty(dataDetailSpecialty) && (
                            <div dangerouslySetInnerHTML={{ __html: dataDetailSpecialty.descriptionHTML }}></div>
                        )}
                    </div>
                    <div className='search-sp-doctor'>
                        <select onChange={(event) => this.handleOnChangeSelect(event)}>
                            {listProvice &&
                                listProvice.length > 0 &&
                                listProvice.map((item, index) => {
                                    return (
                                        <option key={index} value={item.key}>
                                            {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                        </option>
                                    )
                                })}
                        </select>
                    </div>
                    {arrDoctorId &&
                        arrDoctorId.length > 0 &&
                        arrDoctorId.map((item, index) => {
                            return (
                                <div className='each-doctor' key={index}>
                                    <div className='dt-content-left'>
                                        <div className='profile-doctor'>
                                            <ProfileDoctor
                                                doctorId={item}
                                                isShowDescriptionDoctor={true}
                                                isShowLinkDetail={true}
                                                isShowPrice={false}
                                                // dataTime={dataTime}
                                            />
                                        </div>
                                    </div>
                                    <div className='dt-content-right'>
                                        <div className='doctor-schedule'>
                                            <DoctorSchedule doctorIdFromParent={item} />
                                        </div>
                                        <div className='doctor-extra-infor'>
                                            <DoctorExtraInfor doctorIdFromParent={item} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        language: state.app.language
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailSpecialty)
