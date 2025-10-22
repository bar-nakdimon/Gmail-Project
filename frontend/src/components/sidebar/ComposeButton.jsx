import { useNavigate } from 'react-router-dom';
import '../../styles.css';
import { FiEdit2 } from '../../icons/Icons';

export default function ComposeButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/compose')}
      className="compose-button"
    >
       <span><FiEdit2 className="label-icon" /></span>
        Compose
    </button>
  );
}