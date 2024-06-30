# WavePlay : Video Hosting Backend Project

# Introduction

◦ This is a full-fledged backend project, excluding frontend components, rigorously tested on Postman for seamless
operation, while maintaining compliance with industry standards and best practices.

◦ Developed a comprehensive video hosting website with full backend functionalities using Node.js, Express.js,
MongoDB, Mongoose, JWT, and bcrypt.

◦ Implemented standard security practices such as JWT, bcrypt, access tokens, and refresh tokens for user authentication
and authorization.

# Model Diagram

![WavePlay Model](public/assets/diagram-export-28-06-2024-19_04_10.png)


# Features

- User (Authentication, Update Details, Tokens, Password Encryption, Watch History, User Profile)
- Dashboard
- Video (Upload, Get, Delete, Update, Publish Status)
- Like/dislike videos
- Comment
- Subscription and Unsubscription 
- Playlist (Create, Delete, Add Video, Remove Video)
- Tweet ( Common Page to show all  user's tweets)

# Instructions for testing with Postman

Follow the steps below to fork a copy of the project collection from Postman and test all API routes.

## Prerequisites

- Ensure you have [Postman](https://www.postman.com/downloads/) installed on your machine.
- You should have access to the project Postman collection link.

## Steps to Fork and Test API Routes

### 1. Fork the Postman Collection

1. **Open Postman**: Launch the Postman application.
2. **Navigate to the Collection Link**: Open the shared Postman collection [link](https://elements.getpostman.com/redirect?entityId=31853383-989137d4-7b56-487f-83ed-9e0ced232422&entityType=collection) in your browser. This link should be provided by the project owner.
3. **Fork the Collection**:
   - Click on the **Fork** button in the Postman interface.
   - Select your workspace where you want to fork this collection.
   - Click **Fork Collection**.

     
### 2. Set Up Environment Variables

1. **Navigate to the Environment**:
   - In Postman, go to the **Environments** tab on the left sidebar.
   - Create a new environment or select an existing one.
2. **Add Environment Variables**:
   - Add the necessary environment variables that your API requires (e.g., `server`).
   - Make sure to replace placeholder values with actual values relevant to your setup.

### 3. Import Environment File (Optional)

If the project provides an environment file, you can import it directly:

1. **Import Environment**:
   - Click on the **Import** button in the Postman interface.
   - Select the provided environment file (e.g., `environment.json`).
   - Click **Import**.

### 4. Test API Routes

1. **Navigate to the Forked Collection**:
   - In the Postman sidebar, go to **Collections**.
   - Find the forked collection and expand it to see all the routes.
2. **Run Requests**:
   - Click on any request to open it.
   - Ensure the correct environment is selected in the top-right corner.
   - Click **Send** to execute the request.
   - Check the response and validate it against the expected output.

### 5. Run Collection Runner (Optional)

To test all routes at once:

1. **Open Collection Runner**:
   - Click on the **Runner** button in the Postman interface.
2. **Select Collection**:
   - Choose the forked collection you want to run.
3. **Select Environment**:
   - Choose the appropriate environment from the dropdown.
4. **Run Collection**:
   - Click **Start Run** to execute all requests in the collection.
   - Review the results and ensure all tests pass.

### 6. Update Forked Collection (Optional)

If there are updates to the original collection:

1. **Navigate to the Original Collection**:
   - Go to the original collection link provided.
2. **Merge Changes**:
   - Compare the forked collection with the original.
   - Merge changes if necessary to keep your forked collection updated.

## Troubleshooting

- If you encounter issues with environment variables, double-check that all necessary variables are defined and correctly assigned.
- For authentication errors, ensure your API keys or tokens are valid and not expired.

---

By following these steps, you can successfully fork the project collection from Postman and test all routes to ensure everything works as expected. Happy testing!


