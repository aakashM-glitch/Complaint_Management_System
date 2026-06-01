# Eclipse IDE Setup Guide

## Prerequisites
- Eclipse IDE for Enterprise Java and Web Developers (latest version)
- Java 17 JDK installed
- Maven installed (or use Eclipse's embedded Maven)

## Import Backend Project

### Step 1: Import Maven Project
1. Open Eclipse IDE
2. Go to **File → Import**
3. Select **Maven → Existing Maven Projects**
4. Click **Next**
5. Browse to the `backend` folder
6. Click **Finish**

### Step 2: Configure Java Version
1. Right-click on the project
2. Select **Properties**
3. Go to **Java Build Path → Libraries**
4. Remove any old JRE System Library
5. Click **Add Library → JRE System Library**
6. Select **Workspace default JRE (JavaSE-17)** or **Installed JREs**
7. Ensure Java 17 is selected
8. Click **Apply and Close**

### Step 3: Configure Java Compiler
1. Right-click on the project → **Properties**
2. Go to **Java Compiler**
3. Set **Compiler compliance level** to **17**
4. Click **Apply and Close**

### Step 4: Update Maven Project
1. Right-click on the project
2. Select **Maven → Update Project**
3. Check **Force Update of Snapshots/Releases**
4. Click **OK**

### Step 5: Configure Application Properties
1. Open `src/main/resources/application.properties`
2. Update database credentials:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

## Run the Application

### Option 1: Run as Spring Boot App
1. Right-click on `ComplaintManagementSystemApplication.java`
2. Select **Run As → Spring Boot App**
3. Check console for: `Started ComplaintManagementSystemApplication`

### Option 2: Run as Java Application
1. Right-click on `ComplaintManagementSystemApplication.java`
2. Select **Run As → Java Application**

### Option 3: Maven Run
1. Right-click on the project
2. Select **Run As → Maven build...**
3. Enter goal: `spring-boot:run`
4. Click **Run**

## Troubleshooting

### Issue: Maven Dependencies Not Downloading
**Solution:**
1. Right-click project → **Maven → Update Project**
2. Check **Force Update of Snapshots/Releases**
3. If still failing, check internet connection
4. Try: Right-click project → **Maven → Reload Projects**

### Issue: Java Version Mismatch
**Solution:**
1. Window → Preferences → Java → Installed JREs
2. Add Java 17 JDK if not present
3. Set it as default
4. Update project Java Build Path

### Issue: Port 8080 Already in Use
**Solution:**
1. Change port in `application.properties`:
   ```properties
   server.port=8081
   ```
2. Or stop the process using port 8080

### Issue: Database Connection Error
**Solution:**
1. Verify MySQL is running
2. Check database credentials in `application.properties`
3. Ensure database `complaint_db` exists
4. Run the schema SQL file if needed

### Issue: JWT Token Errors
**Solution:**
1. Check `jwt.secret` in `application.properties`
2. Ensure secret is at least 256 bits (32 characters)
3. Restart the application

## Project Structure in Eclipse

After import, you should see:
```
complaint-management-system (backend)
├── src/main/java
│   └── com.complaint
│       ├── ComplaintManagementSystemApplication.java
│       ├── controller/
│       ├── dto/
│       ├── entity/
│       ├── exception/
│       ├── repository/
│       ├── security/
│       ├── service/
│       └── util/
├── src/main/resources
│   └── application.properties
└── pom.xml
```

## Recommended Eclipse Plugins

1. **Spring Tools 4** (Spring Boot support)
2. **Maven Integration** (usually pre-installed)
3. **Lombok** (NOT needed - we're not using Lombok)

## Code Formatting

1. Window → Preferences → Java → Code Style → Formatter
2. Import/Use a standard formatter (e.g., Google Java Style)
3. Apply to project: Right-click project → Source → Format

## Debugging

1. Set breakpoints in your code
2. Right-click on `ComplaintManagementSystemApplication.java`
3. Select **Debug As → Spring Boot App**
4. Use Eclipse debug perspective for step-through debugging

## Build Project

1. Right-click project → **Maven → Update Project**
2. Right-click project → **Build Project** (or use Ctrl+B)
3. Check **Problems** view for any errors

## Export as JAR

1. Right-click project → **Export**
2. Select **Java → JAR file**
3. Or use Maven: Right-click project → **Run As → Maven build...**
4. Goal: `package`
5. JAR will be in `target/` folder
