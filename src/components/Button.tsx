import React, { FunctionComponent } from 'react';
import styles from '../styles/Button.module.scss';

const Button: FunctionComponent<{ onClick: Function }> = ({ children, onClick }) => {
    return (
        <button className={styles.button} onClick={() => onClick()}>
            {children}
        </button>
    );
};

export default Button;
