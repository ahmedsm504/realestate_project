Real Estate Project
A web application built with Django that facilitates a real estate platform. The project connects realtors with potential buyers/renters, offering features for property listings, user authentication, and interactive property details.

Features
User Authentication: Supports different user types:

Normal Users: Can browse properties, add them to a favorites list, and send inquiries to realtors.

Realtors: Can create, edit, and delete their property listings.

Property Management: Realtors have a dedicated dashboard to manage their properties.

Favorites System: Authenticated users can add or remove properties from their personal favorites list.

Inquiry System: Users can send direct inquiries to realtors about specific properties.

Responsive Design: The user interface is built using Tailwind CSS, ensuring a clean and responsive layout on all devices.

Image Gallery: Property pages include a main image and a gallery of thumbnails.

Getting Started
Follow these steps to set up and run the project on your local machine.

Prerequisites
Python 3.8 or higher

Git

Installation
Clone the repository:

git clone https://github.com/ahmedsm504/realestate_project.git
cd realestate_project

Create a virtual environment:

python -m venv real_estate_env
# On Windows:
.\real_estate_env\Scripts\activate
# On macOS/Linux:
source real_estate_env/bin/activate

Install the requirements:

pip install -r requirements.txt

Database setup:
Run the database migrations to create the necessary tables.

python manage.py makemigrations
python manage.py migrate

Create a superuser (admin):
This will allow you to access the Django admin panel to manage properties and users.

python manage.py createsuperuser

Run the development server:

python manage.py runserver

The application should now be accessible at http://127.0.0.1:8000.

Technology Stack
Backend: Django

Frontend: HTML, CSS, JavaScript

Styling: Tailwind CSS

Database: SQLite (default for development)

Feel free to explore and contribute to the project!
