import React, { useState } from 'react';
import './Contact.css';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from '../../config';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ show: false, type: '', message: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            // Gửi dữ liệu form đến server
            const response = await fetch(`${API_BASE_URL}/submit-contact-form`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
    
            if (response.ok) {
                // Xử lý thành công
                console.log('Form submitted successfully');
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
                alert('Thank you for your message. We will contact you soon!');
            } else {
                // Xử lý lỗi
                console.error('Failed to submit form');
                const errorData = await response.json();
                alert('Error submitting form: ' + errorData.error); 
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting form');
        }
    };

    return (
        <div className="contact">
            <div className="contact-hero">
                <h1>Contact Us</h1>
                <p>Get in touch with us for any questions or support</p>
            </div>

            <div className="contact-container">
                <div className="contact-info">
                    <h2>Contact Information</h2>
                    <div className="info-items">
                        <div className="info-item">
                            <FaPhone className="info-icon" />
                            <div>
                                <h3>Phone</h3>
                                <p>+84 766 906 354</p>
                            </div>
                        </div>
                        
                        <div className="info-item">
                            <FaEnvelope className="info-icon" />
                            <div>
                                <h3>Email</h3>
                                <p>phamthehuy18052002@gmail.com</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <FaMapMarkerAlt className="info-icon" />
                            <div>
                                <h3>Address</h3>
                                <p>No. 160, 30/4 Street, An Phu Ward</p>
                                <p>Ninh Kieu District, Can Tho City</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <FaClock className="info-icon" />
                            <div>
                                <h3>Working Hours</h3>
                                <p>Monday - Friday: 9:00 AM - 9:00 PM</p>
                                <p>Weekend: 9:00 AM - 5:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="contact-form">
                    <h2>Send Us A Message</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your Name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Your Email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Subject"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Your Message"
                                required
                                rows="5"
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-btn">Send Message</button>
                    </form>
                </div>
            </div>

            <div className="contact-map">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15715.416474246635!2d105.7776443!3d10.0288947!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a062a8990f568d%3A0x2a22d599b2c06b23!2sGreenwich%20Vi%E1%BB%87t%20Nam!5e0!3m2!1sen!2s!4v1732311962913!5m2!1sen!2s%22%20width=%22600%22%20height=%22450%22%20style=%22border:0;%22%20allowfullscreen=%22%22%20loading=%22lazy%22%20referrerpolicy=%22no-referrer-when-downgrade" 
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="location map"
                ></iframe>
            </div>
        </div>
    );
};

export default Contact;