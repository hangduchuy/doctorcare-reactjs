import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { ConnectedRouter as Router } from 'connected-react-router'
import { history } from '../redux'
import { ToastContainer } from 'react-toastify'

import { userIsAuthenticated, userIsNotAuthenticated } from '../hoc/authentication'

import { path } from '../utils'

import Home from '../routes/Home'
import Login from './Auth/Login'
import System from '../routes/System'

import HomePage from './HomePage/HomePage.js'
import CustomScrollbars from '../components/CustomScrollbars'
import DetailDoctor from './Patient/Doctor/DetailDoctor'
import Doctor from '../routes/Doctor'
import VerifyEmail from './Patient/VerifyEmail'
import DetailSpecialty from './Patient/Specialty/DetailSpecialty'
import AllSpecialty from './Patient/Specialty/GetAllSpecialty'
import DetailClinic from './Patient/Clinic/DetailClinic'
import DetailHandbook from './Patient/Handbook/DetailHandbook'
import AllDoctor from './Patient/Doctor/GetAllDoctor'
import NotFound from './NotFound/NotFound.js'
import Assistant from '../routes/Assistant.js'
import FacebookSDK from '../components/FacebookSDK/FacebookSDK.js'
class App extends Component {
    handlePersistorState = () => {
        const { persistor } = this.props
        let { bootstrapped } = persistor.getState()
        if (bootstrapped) {
            if (this.props.onBeforeLift) {
                Promise.resolve(this.props.onBeforeLift())
                    .then(() => this.setState({ bootstrapped: true }))
                    .catch(() => this.setState({ bootstrapped: true }))
            } else {
                this.setState({ bootstrapped: true })
            }
        }
    }

    loadFacebookSDK() {
        // Load Facebook SDK script dynamically
        console.log('loadFacebookSDK')
        if (!window.FB) {
            console.log('loadFacebookSDK123')
            const script = document.createElement('script')
            script.src = 'https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js'
            script.async = true
            document.body.appendChild(script)

            script.onload = () => {
                // Initialize Facebook SDK after script is loaded
                window.FB.init({
                    xfbml: true,
                    version: 'v18.0'
                })
            }
        }
    }

    componentDidMount() {
        this.handlePersistorState()
        // Load Facebook SDK script
        this.loadFacebookSDK()
    }

    render() {
        return (
            <Fragment>
                <Router history={history}>
                    <div className='main-container'>
                        <div className='content-container'>
                            <CustomScrollbars style={{ height: '100vh', width: '100%' }}>
                                <Switch>
                                    <Route path={path.HOME} exact component={Home} />
                                    <Route path={path.LOGIN} component={userIsNotAuthenticated(Login)} />
                                    <Route path={path.SYSTEM} component={userIsAuthenticated(System)} />
                                    <Route path={path.DOCTOR} component={userIsAuthenticated(Doctor)} />
                                    <Route path={path.ASSISTANT} component={userIsAuthenticated(Assistant)} />
                                    <Route path={path.HOMEPAGE} component={HomePage} />
                                    <Route path={path.DETAIL_DOCTOR} component={DetailDoctor} />
                                    <Route path={path.GETALL_DOCTOR} component={AllDoctor} />
                                    <Route path={path.VERIFY_EMAIL_BOOKING} component={VerifyEmail} />
                                    <Route path={path.DETAIL_SPECIALTY} component={DetailSpecialty} />
                                    <Route path={path.GETALL_SPECIALTY} component={AllSpecialty} />

                                    <Route path={path.DETAIL_CLINIC} component={DetailClinic} />
                                    <Route path={path.DETAIL_HANDBOOK} component={DetailHandbook} />

                                    <Route path='/not-found' component={NotFound} />
                                    <Route path='*' component={NotFound} />
                                </Switch>
                            </CustomScrollbars>
                        </div>

                        {/* <ToastContainer
                            className="toast-container" toastClassName="toast-item" bodyClassName="toast-item-body"
                            autoClose={false} hideProgressBar={true} pauseOnHover={false}
                            pauseOnFocusLoss={true} closeOnClick={false} draggable={false}
                            closeButton={<CustomToastCloseButton />}
                        /> */}

                        <ToastContainer
                            position='bottom-right'
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme='light'
                        />
                        <FacebookSDK />
                    </div>
                </Router>
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        started: state.app.started,
        isLoggedIn: state.user.isLoggedIn
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
