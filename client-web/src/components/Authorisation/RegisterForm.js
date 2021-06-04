import './RegisterForm.css';
import './AuthForm.css';
import {useEffect, useState} from "react";
import iconClose from "../../icons/close.svg";
import {TextField} from "@material-ui/core";

const RegisterForm = ({active, setActive, authMethod, setShowLogin}) => {

    const agreePolicyText = 'I accept the terms of the User Agreement and give my consent to the processing of my personal information under the conditions set out in the Privacy Policy.';
    const emailValidText = 'Email must contain between 11 and 27 characters, be in format ***@***.** .';
    const passwordValidText = 'Password must contain between 8 and 16 characters: at least one letter (a-Z), one number (0-9), and may contain at(@), dot(.), underscore(_) or dash(-).'
    const repeatPassValidText = 'Passwords does not match.';

    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');
    const [repeatPass, setRepeatPass] = useState('');
    authMethod = authMethod.bind(null, email, password);

    const [policyAgreement, setPolicyAgreement] = useState(false);
    const [validEmail, setValidEmail] = useState(false);
    const [validPass, setValidPass] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(false);
    const [canRegister, setCanRegister] = useState(false);


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
        setCanRegister(validEmail && validPass && passwordsMatch && policyAgreement)
    }, [validEmail, validPass, passwordsMatch, policyAgreement])

    return <div className='auth-form'>
        <div className='register-form'>
            <img className='close-icon' src={iconClose} onClick={()=>{setActive(false)}}/>
            <div className='register-container'>
                <div className='form-title'>Registration</div>
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
                               setPasswordsMatch(e.target.value === repeatPass);
                           }}/>
                <TextField className='form-input'
                           error={!passwordsMatch}
                           label="Repeat Password"
                           type="password"
                           autoComplete="current-password"
                           helperText={passwordsMatch ? '': repeatPassValidText}
                           variant="outlined"
                           value={repeatPass}
                           onChange={(e)=>{
                               setRepeatPass(e.target.value);
                               setPasswordsMatch(password === e.target.value);
                           }}/>
                <div className='argee-policy-container'>
                    <input type='checkbox'
                           className='argee-policy-checkbox'
                           value={policyAgreement}
                           onClick={()=>{setPolicyAgreement(!policyAgreement)}}/>
                    <div className='argee-policy-text'>{agreePolicyText}</div>
                    {policyAgreement}
                </div>
                <button className='enter-button'
                        disabled={!canRegister}
                        style={!canRegister ? {background: 'darkgrey'} : {}}
                        onClick={()=>{
                    authMethod();
                    setActive(false);
                    console.log({email, password, repeatPass});
                }}>Sign Up</button>
                <div className='footer-container'>
                    <div className='login-proposal'>Already have an account?</div>
                    <div className='link-to-login'
                         onClick={()=>{
                             setShowLogin(true);
                             setActive(false);
                         }}>Log In</div>
                </div>
            </div>
        </div>
    </div>
};

export default RegisterForm;