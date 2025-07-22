from flask import Flask, render_template, request, redirect,session,url_for
import os 
import pymysql
import matplotlib.pyplot as plt

app = Flask(__name__)
app.secret_key = 'Deep@2004'  # Set a secret key for session management
# Function to establish a connection to the database
logid=[]
try:
    cnx = pymysql.connect(
        host='localhost',
        user='root',
        password='Deep@2004',
        database='recipedb',
    )
    cursor = cnx.cursor()
    print("Connection successful!")
except pymysql.MySQLError as e:
    print(f"Connection failed: {e}")

# Function to insert user details into the users table
def insert_user(email, password):
    print(email)
    # Generate username from the email
    username = email
    
    try:
        # Define the SQL query to insert user details
        sql = "INSERT INTO users (username, email, password, user_type) VALUES (%s, %s, %s, %s)"
        # Execute the SQL query with user details
        cursor.execute(sql, (username, email, password, 'user'))
        print("value inserted")
        # Commit the transaction
        cnx.commit()
    except Exception as e:
        print("An error occurred:", e)
    finally:
        print("commited")
        # Close the cursor and database connection

# Function to fetch recipe data from the database
def fetch_recipe_data(dish):
    try:
        # Define your SQL query with parameterization
        cursor.execute("UPDATE recipe SET views = views + 1 WHERE title  = %s", (dish,))
        result=cursor.fetchone()
        print(result)
        cnx.commit()
        sql = """
            SELECT
                r.title AS 'Title',
                GROUP_CONCAT(CONCAT(i.name, ': ', IFNULL(ri.quantity, ''), ' ', IFNULL(ri.unit, '')) ORDER BY i.name SEPARATOR '; ') AS 'Ingredients',
                r.instruction AS 'Procedure',
                r.prep_time AS 'Prep Time',
                c.name AS 'Cuisine'
            FROM recipe r
            JOIN cuisines c ON r.cuisine_id = c.cuisine_id
            JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
            JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
            WHERE r.title LIKE %s
            GROUP BY r.recipe_id;
        """
        # Execute the SQL query with the dish parameter
        cursor.execute(sql, ('%' + dish + '%',))
        # Fetch all rows
        recipes = cursor.fetchall()
        return recipes
    except Exception as e:
        print("An error occurred:", e)
    finally:
        # Close the cursor and database connection
        # cursor.close()
        # cnx.close()
        print(" recipe is found ")

# Route to handle signup form submission
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    print("request is collected at signup page ")
    print(request.method)
    if request.method == 'POST':
        print("in if block")
        # Retrieve user details from the form
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm-password']
        # Check if passwords match
        print(email)
        if password != confirm_password:
            return "Passwords do not match"
        # Insert user details into the users table
        insert_user(email, password)
        # Redirect the user to the login page after signup
        return redirect('/login')
    else:
        return render_template('signup.html')

# Route to render login page
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # Query the database to validate the username and password
        cursor.execute("SELECT user_id FROM users WHERE username = %s AND password = %s", (username, password))
        user = cursor.fetchone()
        if user:
            session['user_id'] = user[0]  # Store the user_id in the session upon successful login
            return redirect('/')
        else:
            return "Invalid username or password"
    else:
        return render_template('login.html')

# Route to handle user logout
@app.route('/logout')
def logout():
    session.pop('user_id', None)  # Clear the user_id from the session upon logout
    return redirect('/')

# Route to render admin login page
@app.route('/adminlog')
def adminlog():
    return render_template('adminlog.html')
@app.route('/addisplay', methods=['GET', 'POST'])


@app.route('/addisplay', methods=['GET', 'POST'])
def addisplay():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        cursor.execute("SELECT password, user_type FROM users WHERE username = %s", (username,))
        result = cursor.fetchone()
        if result and result[1] == 'Admin':
            if result[0] == password:
                try:
                    cursor.execute("SELECT title, views, no_of_bookmarks FROM recipe")
                    recipe_data = cursor.fetchall()
                    
                    cursor.execute("""SELECT recipe_id, AVG(rating) AS avg_rating
                                        FROM recipe_ratings
                                        GROUP BY recipe_id """)
                    avg_ratings_data = cursor.fetchall()
                    data = [(recipe[0], recipe[1], recipe[2], avg_rating[1]) for recipe, avg_rating in zip(recipe_data, avg_ratings_data)]
                    
                    # Prepare context data to pass to the template
                    context = {'data': data}
                    
                    # Prepare context data to pass to the template
                    
                    
                    # Render the template with the context data
                    return render_template("addisplay.html", **context)
                
                except Exception as e:
                    # Print any error that occurs during SQL execution
                    print("An error occurred:", e)
                    return "An error occurred while fetching data"
                
            else:
                return "Password is Incorrect"
        else:
            return "User not found or not an admin"


    


# # Route to render home page
@app.route('/')
def home():
    return render_template('home.html')
@app.route('/categories1')
def categories1():
    return render_template('categories1.html')
# Route to render explore page
@app.route('/explore')
def explore():
    return render_template('explore.html')
@app.route('/about')
def about():
    return render_template('about.html')
@app.route('/reach')
def reach():
    return render_template('reach.html')
@app.route('/categories', methods=['GET','POST'])
def categories():
    print("hellowordls")
    if request.method=='GET':
        return render_template('categories.html')
    
# Route to display bookmarked recipes
@app.route('/bookmarked_recipes',methods=['POST']) 
def bookmarked_recipes():
    # Retrieve user_id from the session
    if 'user_id' not in session:
        return "User not logged in"
    
    user = session['user_id']
    cursor.execute("select user_id from users where username=%s",user)
    user_id=cursor.fetchone()
    print(user_id[0])
    
    
    try:
        # Define the SQL query to fetch bookmarked recipe names for the logged-in user
        sql = """
            SELECT r.title AS 'Title'
            FROM bookmarks b
            JOIN recipe r ON b.recipe_id = r.recipe_id
            WHERE b.user_id = %s;
        """
        # Execute the SQL query with the user_id
        cursor.execute(sql, (user_id[0],))
        # Fetch all rows
        bookmarked_recipes = cursor.fetchall()
        print("name of recipe")
        print(bookmarked_recipes)
        context={
            'bookmarked_recipes':bookmarked_recipes,
        }
        # Pass the fetched data to the HTML template for rendering
        return render_template('bookmarked_recipes.html', **context)
    except Exception as e:
        return f"An error occurred: {e}"



@app.route('/type', methods=['GET', 'POST'])
def type():
    if request.method == 'POST':
        food_type = request.form.get('food_type')
        id=0;
        if food_type=='maharashtrian':
            id=1
        elif food_type=='north-indian':
            id=2
        elif food_type=='south-indian':
            id=3
        cursor.execute(f"SELECT r.title AS recipe_name FROM recipe r JOIN cuisines c ON r.cuisine_id = c.cuisine_id WHERE c.cuisine_id = %s ORDER BY c.cuisine_id;", (id,))
        result = cursor.fetchall()
        for i in result:
            print( i[0])
        context ={'food':result}
        # You can return a response here if needed, e.g., redirect or render_template
        return render_template("maharashtrian_food.html",**context)
@app.route('/type1', methods=['GET', 'POST'])
def type1():
    if request.method == 'POST':
        food_type = request.form.get('food_type')
        id = 0
        if food_type == 'maharashtrian':
            id = 1
        elif food_type == 'north-indian':
            id = 2
        elif food_type == 'south-indian':
            id = 3
        cursor.execute("SELECT r.title AS recipe_name FROM recipe r JOIN cuisines c ON r.cuisine_id = c.cuisine_id WHERE c.cuisine_id = %s ORDER BY c.cuisine_id;", (id,))
        result = cursor.fetchall()
        for i in result:
            print(i[0])
        context = {'food': result}
        print("Rendering maharashtrian_food1.html")
        return render_template("maharashtrian_food1.html",**context)
    print("rendering complted")
    # else:
    #     print("GET request received")
    #     return "This route only accepts POST requests."



@app.route('/explore1', methods=['GET', 'POST'])
def explore1():
    print("request is collected on explore1 page " )
    if request.method =='POST':
        username=request.form['username']
        password=request.form['password']
        print(username,password)
        cursor.execute("select password from users where username=%s",(username))
        result=cursor.fetchone()
        
        if result:
            print(result[0])
            if password==result[0]:
                session['user_id'] = username  # Store the user_id in the session upon successful login
                logid.append(username)
                return render_template('explore1.html')
            else:
                return 'wrong password '
        else:
            return 'user not found...'

# Route to render varanbhat page
@app.route('/varanbhat')
def varanbhat():
    # Fetch recipe data from the database
    recipes = fetch_recipe_data()
    context = {'recipes': recipes}
    print(recipes)
    # Pass the fetched data to the HTML template for rendering
    return render_template('varanbhat.html', **context)
    
@app.route('/filter', methods=['GET', 'POST'])
def filter():
    if request.method == 'POST':
        dish = request.form.get('recipe_name')
        print(dish)
        # Fetch recipe data from the database
        recipes = fetch_recipe_data(dish)

        if recipes is not None:
            context = {'recipes': recipes}
            # Pass the fetched data to the HTML template for rendering
            return render_template('filter.html', **context)
        else:
            # Handle the case where no recipes are found
            return "No recipes found for the specified dish."
@app.route('/filter1', methods=['GET', 'POST'])
def filter1():
    print("request is collected at filter1 ")
    if request.method == 'POST':
        dish = request.form.get('recipe_name')
        print(dish)
        # Fetch recipe data from the database
        recipes = fetch_recipe_data(dish)
        cursor.execute("SELECT recipe_id FROM recipe WHERE title = %s", (dish,))
        id = cursor.fetchone()

        print(id[0])
        if recipes is not None:
            context = {'recipes': recipes, 'id':id[0]}
            # print(recipes)
            # Pass the fetched data to the HTML template for rendering
            return render_template('filter1.html', **context)
        else:
            # Handle the case where no recipes are found
            return "No recipes found for the specified dish."
    


@app.route('/bookmark', methods=['POST'])
def bookmark_recipe():
    # Ensure user is logged in
    # print(user_id)
    print(logid)
    # if 'user_id' not in session:
    #     return "User not logged in"

    # Retrieve user_id from the session
    # user_id = session['user_id']
    print("hello ")
    # Get recipe_id from the form submission
    recipe_id = request.form['recipe_id']
    username = logid[0]
    cursor.execute("select user_id from users where username=%s",(username))
    user_id=cursor.fetchone()
    print(recipe_id,user_id)
    cursor.execute("UPDATE recipe SET no_of_bookmarks = no_of_bookmarks + 1 WHERE recipe_id  = %s", (recipe_id,))
    result=cursor.fetchone()
    print(result)
    cnx.commit()
    try:
        # Define the SQL query to insert the bookmark into the database
        sql = "INSERT INTO bookmarks (user_id, recipe_id) VALUES (%s, %s)"
        
        # Execute the SQL query with the user_id and recipe_id
        cursor.execute(sql, (user_id, recipe_id))
        
        # Commit the transaction
        cnx.commit()
        
        return "Bookmark saved successfully"
    except Exception as e:
        # Rollback the transaction in case of an error
        cnx.rollback()
        return f"An error occurred: {e}"

# @app.route('/recipes_with_views')
# def recipes_with_views():
#     return render_template('recipes_with_views.html')
# Define the function to fetch recipe names with views greater than 5
# Define the function to fetch recipe names and views with views greater than 5
def fetch_recipe_names():
    try:
        # Define the SQL query to fetch recipe names and views with views greater than 5
        sql = """
            SELECT title, views
            FROM recipe
            WHERE views > 5;  -- Filter recipes with views greater than 5
        """
        cursor.execute(sql)
        recipe_names = cursor.fetchall()
        return recipe_names
    except Exception as e:
        print("An error occurred:", e)
    finally:
        print("Recipe names fetched successfully.")

# Route to display recipes with views greater than 5
# Route to display recipes with views greater than 5
# Route to display recipes with views greater than 5
@app.route('/recipes_with_views', methods=['GET','POST'])
def recipes_with_views():
    if request.method == 'GET':
        recipe_names = fetch_recipe_names()
        context = {'recipes': recipe_names}
        return render_template('recipes_with_views.html', **context)
    else:
        return "Method not allowed"

@app.route('/submit_rating', methods=['POST'])
def submit_rating():
    if request.method == 'POST':
        # Retrieve the username from the session
        username = session.get('user_id')
        
        # Retrieve the recipe_id and rating from the form data
        recipe_id = request.form.get('recipe_id')
        rating = int(request.form.get('rating'))

        try:
            # Fetch user_id from the database based on the username
            cursor.execute("SELECT user_id FROM users WHERE username=%s", (username,))
            result = cursor.fetchone()

            if result:
                user_id = result[0]
                # Insert rating into the database
                cursor.execute("INSERT INTO recipe_ratings (user_id, recipe_id, rating) VALUES (%s, %s, %s)", (user_id, recipe_id, rating))
                cnx.commit()  # Commit the transaction
                return "Rating submitted successfully"
            else:
                return "User not found"
        except Exception as e:
            cnx.rollback()  # Roll back the transaction in case of an error
            return f"An error occurred: {e}"
# Fetch average ratings for all recipes
def fetch_average_ratings():
    try:
        cursor.execute("""
            SELECT recipe_id, AVG(rating) AS avg_rating
            FROM recipe_ratings
            GROUP BY recipe_id
        """)
        avg_ratings = cursor.fetchall()
        return avg_ratings
    except Exception as e:
        print("An error occurred:", e)

# Run the application
if __name__ == '__main__':
    app.run(debug=True)
