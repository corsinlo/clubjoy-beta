import React, { useState } from 'react';
import styles from './TrustPilot.module.css';
import r1 from '../../media/landing/r1.JPG';
import r2 from '../../media/landing/r2.JPG';
import r3 from '../../media/landing/r3.JPG';
import r4 from '../../media/landing/r4.JPG';
import r5 from '../../media/landing/r5.JPG';
import r6 from '../../media/landing/r6.JPG';

const reviews1 = [
  {
    text: '"Siamo un team di 30 persone, con età e background diversissimi. Siamo arrivati al workshop un po’ titubanti—chi pensava di essere negato, chi aveva mille scadenze in testa. Ma bastava vedere il sorriso di ognuno mentre ci si sporcava le mani per capire che stavamo vivendo qualcosa di unico. Per qualche ora, non c’erano ruoli, generazioni o gerarchie. Solo mani impiastricciate e idee che volavano."',
    image: r2,
  },
  {
    text: '"Abbiamo trascorso una giornata incredibile, ricca di creatività e collaborazione. Non importa da dove venivamo o cosa facevamo prima—ci siamo uniti in un’esperienza che ci ha lasciati ispirati e motivati."',
    image: r1,
  },
  {
    text: '"L’energia del team era contagiosa! Per un giorno ci siamo lasciati alle spalle le distrazioni e abbiamo trovato una nuova connessione con i colleghi, scoprendo idee e risate che non immaginavamo."',
    image: r3
  },
];

const reviews2 = [
  {
    text: '"Atmosfera fantastica! Ho creato la mia prima tazza e mi sono sentita super orgogliosa. Lo rifarei subito!"',
    image: r4,
  },
  {
    text: '"Ho (ri)scoperto finalmente il mio lato artistico: liberatorio e divertente, un’esperienza davvero unica!"',
    image: r5,
  },
  {
    text: '"Difficile ormai trovare un momento di relax così. Ho conosciuto nuove persone internazionali e sono andato a casa con qualcosa di bellissimo."',
    image: r6
  },
];

const TrustPilot = ({isTeamBuilding}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reviews = isTeamBuilding? reviews1 : reviews2;
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? reviews.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === reviews.length - 1 ? 0 : prevIndex + 1));
  };

  const { text, image } = reviews[currentIndex];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Potresti essere tu</h2>
      <div className={styles.carousel}>
        <button className={styles.arrow} onClick={handlePrev}>
          &#8249;
        </button>
        <div className={styles.content}>
          <p className={styles.text}>{text}</p>
          <img className={styles.image} src={image} alt="Review" />
        </div>
        <button className={styles.arrow} onClick={handleNext}>
          &#8250;
        </button>
      </div>

      <div className={styles.trustpilot}>
        {/*<span className={styles.tpText}>Trustpilot</span>*/}
        <span className={styles.rating}>
          <span className={styles.star}>&#9733;</span>
          <span className={styles.star}>&#9733;</span>
          <span className={styles.star}>&#9733;</span>
          <span className={styles.star}>&#9733;</span>
          <span className={styles.star}>&#9733;</span>
        </span>

        <div className={styles.arrowsMobile}>
          <button className={styles.arrowMobile} onClick={handlePrev}>
            &#8249;
          </button>
          <button className={styles.arrowMobile} onClick={handleNext}>
            &#8250;
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrustPilot;
