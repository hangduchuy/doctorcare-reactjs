import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Redirect, Route, Switch } from 'react-router-dom'
import Report from '../containers/System/Admin/Report/Report'
import UserRedux from '../containers/System/Admin/UserRedux'
import Header from '../containers/Header/Header'
import ManageDoctor from '../containers/System/Admin/ManageDoctor'
import ManageSpecialty from '../containers/System/Specialty/ManageSpecialty'
import ManageClinic from '../containers/System/Clinic/ManageClinic'
import ManageHandbook from '../containers/System/Handbook/ManageHandbook'
import ManageSchedule from '../containers/System/Doctor/ManageSchedule'
import { USER_ROLE } from '../utils'

class System extends Component {
    componentWillMount() {
        const { userInfo, isLoggedIn, history } = this.props

        if (isLoggedIn === true && userInfo.roleId !== USER_ROLE.ADMIN) {
            history.push('/not-found')
        }
    }

    render() {
        const { systemMenuPath, isLoggedIn } = this.props

        return (
            <React.Fragment>
                {isLoggedIn && <Header />}
                <div className='system-container'>
                    <div className='system-list'>
                        <Switch>
                            <Route path='/system/report' component={Report} />
                            <Route path='/system/user-redux' component={UserRedux} />
                            <Route path='/system/manage-doctor' component={ManageDoctor} />
                            <Route path='/system/manage-specialty' component={ManageSpecialty} />
                            <Route path='/system/manage-clinic' component={ManageClinic} />
                            <Route path='/system/manage-handbook' component={ManageHandbook} />
                            <Route path='/system/manage-schedule' component={ManageSchedule} />
                            <Route
                                component={() => {
                                    return <Redirect to={systemMenuPath} />
                                }}
                            />
                        </Switch>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        systemMenuPath: state.app.systemMenuPath,
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(System))
