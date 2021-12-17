import React, {useState} from 'react';
import './WaveModal.css';

const WaveModal = ({onClose, onSubmit}) => {
  const [value, setValue] = useState('');

 const handleChange = (event) => {
    setValue(event.target.value);
  }


  return (
    <div>
      <div class="modalHeader">
        Send a Message!
      </div>
      <div class="modalInput">
        <textarea class="messageInput" 
          autoFocus 
          maxlength={255} 
          name="messageInput"
          cols="50"
          rows="4"
          value={value}
          onChange={handleChange}
          >
        </textarea>
      </div>
      
      <div class="buttonRow">
        <button class="cancel" onClick={onClose}>
          Nevermind
        </button>
        <button onClick={() => onSubmit(value)}>
          Send it
        </button>
      </div>
    </div>

  );
};

export default WaveModal;