import pymysql
import random
cnx = pymysql.connect(
    host='localhost',
    user='root',
    password='meetali_9304',
    database='recipedb1',
)
cursor = cnx.cursor()

user_id=random.random(6)+1
recipe_id=random.random(36)+1
rating=random.random(5)+1

for i in (1,1000):
    cursor.execute("INSERT INTO recipe_ratings (user_id, recipe_id, rating) VALUES (%s, %s, %s)", (user_id, recipe_id, rating))
    cnx.commit()

cursor.execute("select * from recipe_ratings")
print(cursor.fetchall())