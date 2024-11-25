import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { createClient } from '@supabase/supabase-js';
import { useHistory } from 'react-router-dom'; // Import useHistory
import { PopupButton } from 'react-calendly';
import css from './Newsletter.module.css';
import { PrimaryButton } from '../Button/Button';
import { newsletter } from '../../util/api';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function Newsletter() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isClient, setIsClient] = useState(false); // New state for client-side rendering
  const intl = useIntl();
  const history = useHistory(); // Initialize history

  useEffect(() => {
    setIsClient(true); // Set to true on client side
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const contactData = {
      email,
      firstName: name,
      lastName: lastname,
      isNewsLetter: true,
    };

    try {
      const { data, error } = await supabase
        .from('newsletter')
        .insert([{ email, firstName: name, lastName: lastname }])
        .select();
      newsletter(contactData)
        .then((response) => {
          console.log('response:', response);
        })
        .catch((error) => {
          console.error('Error adding contact:', error.message);
          setErrorMessage(error.message);
        });

      setEmail('');
      setName('');
      setLastname('');
    } catch (error) {
      console.error('Error adding contact:', error.message);
      setErrorMessage(error.message);
    }
  };

  const handleNavigate = () => {
    history.push('/ts');
  };

  const heartStyle = {
    color: 'red',
    margin: '2px',
  };

  return (
    <div className={css.formContainer}>
      <div className={css.buttonContainer}>
        {isClient && ( // Only render PopupButton on the client side
          <PopupButton
            url="https://calendly.com/hello-epym"
            rootElement={document.getElementById('root')}
            text="☎️ Experience Planner gratis"
            className={css.calendlyButton}
          />
        )}
        <PrimaryButton onClick={handleNavigate} className={css.button}>
          Prenota il tuo evento
        </PrimaryButton>
      </div>

      <form onSubmit={handleSubmit} className={css.form}>
        <p style={{ textAlign: 'center' }}>
          {intl.formatMessage({ id: 'Newsletter.header' })}
          <span role="img" aria-label="heart emoji" style={heartStyle}>
            ❤️
          </span>
        </p>
        {errorMessage && <div className={css.alert}>{errorMessage}</div>}
        <div className={css.nameRow}>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={css.nameInput}
            placeholder="Pablo"
          />
          <input
            id="lastname"
            type="text"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
            className={css.nameInput}
            placeholder="Picasso"
          />
        </div>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={css.nameInput}
          placeholder="pablo.picasso@art.it"
        />
        <PrimaryButton type="submit" className={css.button}>
          {intl.formatMessage({ id: 'Newsletter.button' })}
        </PrimaryButton>
      </form>
    </div>
  );
}

export default Newsletter;
