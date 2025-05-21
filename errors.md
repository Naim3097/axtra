error 1:

Console Error


------ Firebase Error ------

lib\utils\errorhandling.js (45:11) @ handleFirebaseError


  43 |  */
  44 | export const handleFirebaseError = (error, operation, path = null) => {
> 45 |   console.error(`------ Firebase Error ------`);
     |           ^
  46 |   console.error(`Operation: ${operation}`);
  47 |   if (path) console.error(`Path: ${path}`);
  48 |   console.error(`Code: ${error.code}`);


  error 2

Console Error


Operation: Content approval

lib\utils\errorhandling.js (46:11) @ handleFirebaseError


  44 | export const handleFirebaseError = (error, operation, path = null) => {
  45 |   console.error(`------ Firebase Error ------`);
> 46 |   console.error(`Operation: ${operation}`);
     |           ^
  47 |   if (path) console.error(`Path: ${path}`);
  48 |   console.error(`Code: ${error.code}`);
  49 |   console.error(`Message: ${error.message}`);

  error 3


  Console Error


Path: contentSubmissions for contentId: C3, email: freewillauto@gmail.com

lib\utils\errorhandling.js (47:21) @ handleFirebaseError


  45 |   console.error(`------ Firebase Error ------`);
  46 |   console.error(`Operation: ${operation}`);
> 47 |   if (path) console.error(`Path: ${path}`);
     |                     ^
  48 |   console.error(`Code: ${error.code}`);
  49 |   console.error(`Message: ${error.message}`);
  50 |   // Log the full error object for debugging


  error 4

  Console Error


Code: permission-denied

lib\utils\errorhandling.js (48:11) @ handleFirebaseError


  46 |   console.error(`Operation: ${operation}`);
  47 |   if (path) console.error(`Path: ${path}`);
> 48 |   console.error(`Code: ${error.code}`);
     |           ^
  49 |   console.error(`Message: ${error.message}`);
  50 |   // Log the full error object for debugging
  51 |   console.error(`Full error:`, JSON.stringify(error, null, 2));


  error 5


  Console Error


Message: Missing or insufficient permissions.

lib\utils\errorhandling.js (49:11) @ handleFirebaseError


  47 |   if (path) console.error(`Path: ${path}`);
  48 |   console.error(`Code: ${error.code}`);
> 49 |   console.error(`Message: ${error.message}`);
     |           ^
  50 |   // Log the full error object for debugging
  51 |   console.error(`Full error:`, JSON.stringify(error, null, 2));
  52 |   



  error 6


  Console Error


Full error: "{\n  \"code\": \"permission-denied\",\n  \"name\": \"FirebaseError\"\n}"

lib\utils\errorhandling.js (51:11) @ handleFirebaseError


  49 |   console.error(`Message: ${error.message}`);
  50 |   // Log the full error object for debugging
> 51 |   console.error(`Full error:`, JSON.stringify(error, null, 2));
     |           ^
  52 |   
  53 |   // Provide specific error interpretations for common Firebase errors
  54 |   const errorMessages = {


    errror 7


    Console Error


---------------------------

lib\utils\errorhandling.js (81:11) @ handleFirebaseError


  79 |   }
  80 |   
> 81 |   console.error(`---------------------------`);
     |           ^
  82 |   
  83 |   // Store error logs in localStorage for debugging
  84 |   try {