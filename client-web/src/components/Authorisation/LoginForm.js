import './LoginForm.css';
import './AuthForm.css';
import iconClose from './../../content/icons/close.svg';
import {TextField} from "@material-ui/core";
import {useEffect, useState} from "react";

const LoginForm = ({active, setActive, authMethod, setShowRegister}) => {

    const emailValidText = 'Enter your email.';
    const passwordValidText = 'Enter your password.'

    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');
    authMethod = authMethod.bind(null, email, password);

    const [validEmail, setValidEmail] = useState(false);
    const [validPass, setValidPass] = useState(false);
    const [canLogin, setCanLogin] = useState(false);


    const EmailValid = (email) => {
        if(email.length < 11 || email.length > 27){
            setValidEmail(false);
            return;
        }
        const regExp = /[a-z0-9_.-]+@.+\..+/i;
        let match = email.match(regExp);

        setValidEmail(match && match.index === 0);
    };
    const PasswordValid = (password) => {
        if(password.length < 8 || password.length > 16) {
            setValidPass(false);
            return;
        }
        const regExp = /^[a-zA-Z0-9_.@-]*$/;
        let match = password.match(regExp);
        setValidPass(match && match.index === 0);
    };

    useEffect(()=>{
        setCanLogin(validEmail && validPass)
    }, [validEmail, validPass])

    return <div className='auth-form'>
        <div className='login-form'>
            <img className='close-icon' src={iconClose} onClick={()=>{setActive(false)}}/>
            <div className='login-container'>
                <div className='form-title'>Login</div>
                <TextField className='form-input'
                           error={!validEmail}
                           label="Email"
                           variant="outlined"
                           helperText={validEmail ? '': emailValidText}
                           value={email}
                           onChange={(e)=>{
                               setEmail(e.target.value);
                               EmailValid(e.target.value);
                           }}/>
                <TextField className='form-input'
                           error={!validPass}
                           label="Password"
                           type="password"
                           autoComplete="current-password"
                           helperText={validPass ? '': passwordValidText}
                           variant="outlined"
                           value={password}
                           onChange={(e)=>{
                               setPassword(e.target.value);
                               PasswordValid(e.target.value);
                           }}/>
                <button className='enter-button'
                     disabled={!canLogin}
                     style={!canLogin ? {background: 'darkgrey'} : {}}
                     onClick={()=>{
                         authMethod();
                         setActive(false);
                         console.log({email, password});}
                     }>Log In</button>
                <div className='forget-password'>Forget password?</div>
                <div className='footer-container'>
                    <div className='register-proposal'>Have no account yet?</div>
                    <div className='link-to-register'
                         onClick={()=>{
                             setShowRegister(true);
                             setActive(false);
                         }}>Register</div>
                </div>
            </div>
        </div>
    </div>
};

export default LoginForm;