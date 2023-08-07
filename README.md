# Cinema Project - Setup Instructions

This repository contains the client and server applications for the Cinema App. This client side was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.1.5, while the server application is a .NET Web API version 7.0.306 that uses PostgreSQL as the backend database.

## Prerequisites

Before running the Cinema App, ensure that you have the following software installed on your system:

    1. Node.js (LTS version)
    2. Angular CLI
    3. .NET 7 SDK
    4. PostgreSQL

## Getting Started

To set up and run the Cinema App, follow these steps:

### Client (Angular)

1. Open a terminal or command prompt.
2. Navigate to the **`client`** directory: **cd client**.
3. Install the required dependencies: **npm install**.
4. Run the development server: **ng serve**.
5. The client application will be accessible at http://localhost:4200 in your web browser.

### Server (.NET Web API)

1. Open a new terminal or command prompt.
2. Navigate to the **`server`** directory: **cd server**.
3. Run the following command to install the required packages:

   ```
   dotnet restore
   ```

   This will download and install all the necessary NuGet packages specified in the server.csproj file.

4. Create a new PostgreSQL database for the Cinema App.
5. Update the connection string in the **`appsettings.json`** file with your PostgreSQL database and Email credentials.

   ```
   "EmailSettings": {
    "From": "[twojedane]@comarch.pl",
    "To": "[docelowy@gmail.com]",
    "Host": "smtp.comarch.com",
    "Port": "465",
    "SmtpPassword": "[twojeHasloPocztowe]"
   }
   ```

   ```"ConnectionStrings": {
    "DefaultConnection": "Host=localhost; Database=[nazwabazydanych]; Username=[wpisznazwe]; Password=[wpiszhaslo]"},
   ```

6. **Important:** If this is the first run, you need to create the initial migration to set up the database. Run the following command:

   ```
   dotnet ef migrations add IntialCreate
   ```

   This will create the necessary migration files based on your data models.

7. Apply the migrations to create the required tables:

   ```
   dotnet ef database update
   ```

   This will create the database tables based on the migration files.

8. Run the server application: `dotnet run`.
9. The server will start running at: `http://localhost:5295`.

## Additional Notes

- Ensure that PostgreSQL is running and accessible before starting the server application.
- You can use tools like pgAdmin or psql to interact with the PostgreSQL database.
- The client application communicates with the server API to fetch data and perform actions.

Now, you have the Cinema App up and running on your local machine. You can access it by navigating to http://localhost:4200 in your web browser.

Happy coding!:)
