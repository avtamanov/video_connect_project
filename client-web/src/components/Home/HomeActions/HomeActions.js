import './HomeActions.css';
import plusIcon from '../../../icons/plus_square_icon.png';
import {Link} from "react-router-dom";

const HomeActions = ({routes}) => {

    return <div className='home-actions-container'>
        <Link className='action-link' to={routes.createVideoRoom}>
            <div className='home-action-item'>
                <img className='action-icon' src={plusIcon}/>
                <div className='action-title'>Create new room</div>
            </div>
        </Link>
        <Link className='action-link' to={routes.joinVideoRoom}>
            <div className='home-action-item'>
                <img className='action-icon' src={plusIcon}/>
                <div className='action-title'>Join room</div>
            </div>
        </Link>
        <Link className='action-link' to={routes.testRoom}>
            <div className='home-action-item'>
                <img className='action-icon' src={plusIcon}/>
                <div className='action-title'>Test room</div>
            </div>
        </Link>
        <Link className='action-link' to={routes.home}>
            <div className='home-action-item'>
                <img className='action-icon' src={plusIcon}/>
                <div className='action-title'>Coming soon...</div>
            </div>
        </Link>
    </div>
};

export default HomeActions;