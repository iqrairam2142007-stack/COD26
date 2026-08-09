-- Restores the original COD26 course content from
-- COD26-FINAL-COMPLETE.zip (17 units, 6 real pages each, code
-- examples, discussion questions and assignments), and adds nine
-- further units to make 26. Unit ids are never reused or shifted,
-- so existing unit_progress rows stay valid.

-- Fields the original content needs and the table did not have.
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS highlights   TEXT[];
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS code_example TEXT;
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS quiz_prompt  TEXT;
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS summary      TEXT;

INSERT INTO public.units
  (id, title, difficulty, duration, position, is_free, is_published,
   highlights, code_example, quiz_prompt, summary,
   assignment_title, assignment_deadline_days, assignment_points)
VALUES
  (1, 'Introduction to Python', 'Beginner', '4 hours', 1, TRUE, TRUE, ARRAY['Readable syntax', 'Beginner friendly', 'Used in AI, web, automation']::text[], '# Your first Python program
print("Hello, COD26!")

# A comment explains what the program does
print("Python is a beginner-friendly language.")', 'Why is Python considered a good first programming language?', 'Python is a high-level programming language designed to help humans write understandable instructions for computers. It focuses on readability, which means the code often looks close to natural logic. This is one reason it is widely used in', 'Write a short Python program that prints your name, your goal, and one reason you want to learn Python.', 10, 10),
  (2, 'Variables & Data Types', 'Beginner', '5 hours', 2, FALSE, TRUE, ARRAY['Store information', 'Strings, integers, floats, booleans', 'Meaningful names matter']::text[], 'student_name = "Riya"
age = 15
percentage = 89.5
is_active = True

print(student_name)
print(type(age))
print(type(percentage))
print(type(is_active))', 'What is the difference between a string and an integer?', 'A variable stores data so that your program can use it later. Instead of repeating the same value everywhere, you assign it to a name. This makes code easier to understand, update, and debug.', 'Create variables for your name, age, favorite subject, and school/college, then print all of them clearly.', 10, 10),
  (3, 'Operators', 'Beginner', '4 hours', 3, FALSE, TRUE, ARRAY['Arithmetic', 'Comparison', 'Logical', 'Membership']::text[], 'a = 10
b = 3

print(a + b)
print(a > b)
print(a % b)
print(a > 5 and b < 5)
print("py" in "python")', 'Why do comparison operators usually return True or False?', 'Arithmetic operators perform calculations like addition, subtraction, multiplication, division, modulus, floor division, and exponentiation. These are used in marks calculation, billing systems, and data processing tasks.', 'Build a mini calculator that shows arithmetic results for two numbers.', 10, 10),
  (4, 'Control Flow: If/Else', 'Beginner', '4 hours', 4, FALSE, TRUE, ARRAY['Decision making', 'if, elif, else', 'Truthy and falsy values']::text[], 'marks = 82

if marks >= 90:
    print("Grade A+")
elif marks >= 75:
    print("Grade A")
elif marks >= 40:
    print("Pass")
else:
    print("Fail")', 'When should you use elif in a program?', 'A program becomes useful when it reacts differently in different situations. Decision-making lets the program choose what to do based on user data, marks, permissions, or payment status.', 'Create a grade system using if, elif, and else.', 10, 10),
  (5, 'Loops: For/While', 'Beginner', '5 hours', 5, FALSE, TRUE, ARRAY['Repetition', 'for loop', 'while loop', 'break and continue']::text[], 'for number in range(1, 6):
    print("For loop:", number)

count = 1
while count <= 3:
    print("While loop:", count)
    count += 1', 'What is one major difference between a for loop and a while loop?', 'Loops repeat actions efficiently. Without loops, many tasks would require writing the same statement again and again, which is slow and error-prone.', 'Print numbers from 1 to 10 using both a for loop and a while loop.', 10, 10),
  (6, 'Data Structures: Lists', 'Beginner', '5 hours', 6, FALSE, TRUE, ARRAY['Ordered collection', 'Mutable', 'Indexing', 'Methods']::text[], 'fruits = ["apple", "banana", "mango"]
fruits.append("orange")
fruits[1] = "grapes"
print(fruits)
print(fruits[0])
print(fruits[1:3])', 'Why are lists called mutable?', 'A list is a collection that stores multiple values in order. Lists are flexible because they can be changed after creation, making them ideal for dynamic program data.', 'Create a list of your favorite subjects, then add and remove one item.', 10, 10),
  (7, 'Tuples & Sets', 'Beginner', '4 hours', 7, FALSE, TRUE, ARRAY['Tuple is fixed', 'Set keeps unique values', 'Set operations']::text[], 'colors = ("red", "green", "blue")
subjects = {"Math", "Science", "Math", "English"}
print(colors)
print(subjects)
print("Science" in subjects)', 'Why would you choose a set instead of a list in some situations?', 'A tuple is like a list but cannot be changed after creation. It is useful when the stored data should remain fixed.', 'Create two sets and find their union and intersection.', 10, 10),
  (8, 'Dictionaries', 'Beginner', '5 hours', 8, FALSE, TRUE, ARRAY['Key-value pairs', 'Fast access', 'Mutable structure']::text[], 'student = {
    "name": "Riya",
    "marks": 92,
    "city": "Delhi"
}

student["marks"] = 95
print(student["name"])
print(student)', 'Why are dictionaries useful for profile data?', 'A dictionary stores information in key-value pairs. This is useful when data needs labels, such as name, age, marks, or city.', 'Create a dictionary with your name, course, city, and score.', 10, 10),
  (9, 'Functions', 'Beginner', '6 hours', 9, FALSE, TRUE, ARRAY['Reusable logic', 'Parameters', 'Return values', 'Scope']::text[], 'def greet(name):
    return f"Hello, {name}!"

message = greet("COD26 Student")
print(message)', 'What is the benefit of returning a value from a function?', 'Functions help break a large program into smaller reusable tasks. This avoids repetition and makes code easier to test and maintain.', 'Write a function that takes two numbers and returns their product.', 10, 10),
  (10, 'Modules & Packages', 'Intermediate', '4 hours', 10, FALSE, TRUE, ARRAY['Code organization', 'Importing', 'Built-in modules', 'pip']::text[], 'import math
import random

print(math.sqrt(25))
print(random.randint(1, 10))', 'What is the difference between a module and a package?', 'A module is a Python file that contains code you want to reuse. Instead of placing everything in one file, you separate tasks into modules for clarity.', 'Import the math module and print the square root of a number.', 10, 10),
  (11, 'File Handling', 'Intermediate', '5 hours', 11, FALSE, TRUE, ARRAY['Read files', 'Write files', 'Append mode', 'Context manager']::text[], 'with open("notes.txt", "w") as file:
    file.write("COD26 Python notes")

with open("notes.txt", "r") as file:
    print(file.read())', 'Why is with open(...) recommended in Python?', 'Programs often need to save information permanently. File handling allows data to be stored even after the program closes.', 'Create a text file, write your goals into it, then read and print the content.', 10, 10),
  (12, 'Exception Handling', 'Intermediate', '5 hours', 12, FALSE, TRUE, ARRAY['try', 'except', 'finally', 'Error safety']::text[], 'try:
    number = int(input("Enter a number: "))
    print(10 / number)
except ValueError:
    print("Please enter a valid integer.")
except ZeroDivisionError:
    print("Zero is not allowed here.")', 'Why should specific exceptions be handled separately?', 'Programs can fail because of invalid input, missing files, bad calculations, or unexpected conditions. Exception handling helps the program respond gracefully.', 'Write a safe division program that handles invalid input and zero division.', 10, 10),
  (13, 'OOP: Classes & Objects', 'Intermediate', '6 hours', 13, FALSE, TRUE, ARRAY['Blueprint and instance', 'Attributes', 'Methods', '__init__']::text[], 'class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

    def show_details(self):
        print(self.name, self.marks)

student1 = Student("Riya", 91)
student1.show_details()', 'What is the relationship between a class and an object?', 'A class is a blueprint for creating objects. It defines what data and actions objects of that type should have.', 'Create a Book or Student class with attributes and one display method.', 10, 10),
  (14, 'Inheritance', 'Intermediate', '5 hours', 14, FALSE, TRUE, ARRAY['Parent and child classes', 'Code reuse', 'Method override', 'super()']::text[], 'class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    def __init__(self, name, course):
        super().__init__(name)
        self.course = course

student = Student("Riya", "Python")
print(student.name, student.course)', 'Why is inheritance helpful in object-oriented programming?', 'Inheritance allows one class to reuse and extend the features of another class. This supports cleaner and less repetitive code.', 'Create a Person class and a Student class that inherits from it.', 10, 10),
  (15, 'Polymorphism', 'Intermediate', '5 hours', 15, FALSE, TRUE, ARRAY['Same method, different behavior', 'Flexibility', 'Duck typing']::text[], 'class Dog:
    def speak(self):
        return "Bark"

class Cat:
    def speak(self):
        return "Meow"

for animal in [Dog(), Cat()]:
    print(animal.speak())', 'How does polymorphism reduce complexity in programs?', 'Polymorphism means the same interface can behave differently depending on the object using it. This creates flexible and reusable program designs.', 'Create two classes with the same method name and show how each object behaves differently.', 10, 10),
  (16, 'Encapsulation & Abstraction', 'Intermediate', '4 hours', 16, FALSE, TRUE, ARRAY['Protect data', 'Hide details', 'Use clear interfaces']::text[], 'class BankAccount:
    def __init__(self, balance):
        self.__balance = balance

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount

    def get_balance(self):
        return self.__balance

account = BankAccount(1000)
account.deposit(500)
print(account.get_balance())', 'Why is abstraction useful in software design?', 'Encapsulation means keeping related data and methods together while controlling how that data is accessed. This protects important values from careless changes.', 'Create a small class that keeps one value private and updates it using methods.', 10, 10),
  (17, 'Final Projects', 'Advanced', '8 hours', 26, FALSE, TRUE, ARRAY['Planning', 'Step-by-step building', 'Debugging', 'Portfolio mindset']::text[], 'project_name = "Student Record Manager"
features = ["Add student", "View student", "Update marks"]

print("Project:", project_name)
for feature in features:
    print("-", feature)', 'Why is project planning important before writing code?', 'A final project combines the concepts learned across the course into one complete program. This is where programming shifts from isolated practice to real problem solving.', 'Design and build a mini project such as a quiz app, student record system, attendance tool, or calculator and prepare it for submission.', 10, 10),
  (18, 'Comprehensions & Lambda Functions', 'Intermediate', '4 hours', 17, FALSE, TRUE, ARRAY['Shorter loops', 'One-line functions', 'Readable when used carefully']::text[], 'marks = [72, 45, 88, 39, 91]

# comprehension with a filter
passed = [m for m in marks if m >= 50]
print(passed)

# dictionary comprehension
names = ["Riya", "Arjun", "Sana"]
scores = [88, 74, 92]
report = {n: s for n, s in zip(names, scores)}
print(report)

# lambda used as a sort key
top = sorted(report.items(), key=lambda pair: pair[1], reverse=True)
print(top)', 'When is a normal def function a better choice than a lambda?', 'A list comprehension builds a list in a single line instead of writing a loop with append. It reads close to English: take every item in a sequence, do something to it, and collect the results. Once you can read one, a lot of real Python co', 'Take a list of at least eight student marks. Use one comprehension to collect the passing marks, one dictionary comprehension to pair names with marks, and sorted with a lambda to print the top three.', 10, 10),
  (19, 'Iterators & Generators', 'Advanced', '5 hours', 18, FALSE, TRUE, ARRAY['Loop one item at a time', 'yield instead of return', 'Handles large data']::text[], 'def countdown(n):
    """Yields numbers from n down to 1, one at a time."""
    while n > 0:
        yield n
        n -= 1

for value in countdown(5):
    print(value)

# a generator expression - no list is ever built
squares = (x * x for x in range(1, 1000001))
print(sum(squares))', 'Why can you not loop over the same generator twice and get the same results?', 'When you write a for loop, Python is not handing you the whole sequence at once. It asks the object for its next item repeatedly until there are none left. Understanding this explains why you can loop over a file, a range, or a dictionary i', 'Write a generator that yields only the even numbers up to a limit the user enters. Print the first ten values, then use a generator expression to sum the even numbers below one million.', 10, 10),
  (20, 'Decorators & Higher-Order Functions', 'Advanced', '5 hours', 19, FALSE, TRUE, ARRAY['Functions are objects', 'Wrap behaviour cleanly', 'Used by real frameworks']::text[], 'import functools
import time

def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.time() - start:.4f}s")
        return result
    return wrapper

@timed
def total_marks(marks):
    return sum(marks)

print(total_marks([70, 85, 92, 61]))', 'What does functools.wraps preserve, and why does it matter when debugging?', 'In Python a function can be stored in a variable, put in a list, and passed to another function. Nothing special happens when you do this. Once that idea is comfortable, decorators stop looking like magic and start looking like ordinary cod', 'Write a decorator called log_call that prints the function name and its arguments before running it. Apply it to two different functions, one taking one argument and one taking three.', 10, 10),
  (21, 'Regular Expressions', 'Advanced', '5 hours', 20, FALSE, TRUE, ARRAY['Search patterns in text', 'Validate input', 'Powerful but easy to overuse']::text[], 'import re

phone = "Call 9876543210 or 9123456789"

# find every ten-digit number
numbers = re.findall(r"\b\d{10}\b", phone)
print(numbers)

# validate an email
pattern = r"^[\w.+-]+@[\w-]+\.[\w.]+$"
print(bool(re.match(pattern, "student@cod26.in")))

# mask all but the last four digits
print(re.sub(r"\d{6}(\d{4})", r"******\1", phone))', 'What is the difference between re.match and re.search?', 'Checking whether text follows a pattern using only string methods becomes long and fragile. A regular expression describes the shape of the text once, and the re module does the matching. Phone numbers, email addresses and dates are common ', 'Write a validator that checks a ten-digit Indian phone number, an email address, and a date in DD/MM/YYYY form. Print whether each test input is valid and explain one pattern in a comment.', 10, 10),
  (22, 'Dates, Times & Calendars', 'Intermediate', '4 hours', 21, FALSE, TRUE, ARRAY['datetime module', 'Formatting and parsing', 'Differences between dates']::text[], 'from datetime import datetime, timedelta

now = datetime.now()
print(now.strftime("%d/%m/%Y %H:%M"))

# an assignment due in ten days
due = now + timedelta(days=10)
print("Due on:", due.strftime("%d %B %Y"))

# validate and parse a typed date
typed = "09/08/2026"
parsed = datetime.strptime(typed, "%d/%m/%Y")
print("Days remaining:", (parsed - now).days)', 'Why is storing a date as a plain string a poor choice?', 'Storing a date as plain text makes comparison and arithmetic painful. The datetime module gives real date and time objects that can be compared, subtracted and formatted correctly, including awareness of month lengths and leap years.', 'Write a program that asks for a birth date, validates it with strptime, then prints the age in years and the number of days until the next birthday.', 10, 10),
  (23, 'Working with JSON & APIs', 'Advanced', '6 hours', 22, FALSE, TRUE, ARRAY['JSON is text', 'Requests and responses', 'Handle failures properly']::text[], 'import json

# JSON text -> Python
raw = ''{"name": "Riya", "marks": [88, 74, 92]}''
student = json.loads(raw)
print(student["name"], sum(student["marks"]) / len(student["marks"]))

# Python -> JSON text
record = {"unit": 23, "completed": True}
print(json.dumps(record, indent=2))

# saving to a file
with open("progress.json", "w") as f:
    json.dump(record, f, indent=2)', 'Why should an API key never be written directly in your source code?', 'JSON is a text format for structured data. It looks very close to a Python dictionary, which is why it feels familiar. Almost every web service sends and receives JSON, so reading it is a required skill for any connected program.', 'Save a dictionary of five students and their marks to a JSON file, read it back, and print the class average. Add a try and except block that prints a clear message if the file is missing.', 10, 10),
  (24, 'Databases with SQLite', 'Advanced', '6 hours', 23, FALSE, TRUE, ARRAY['Data that survives restarts', 'SQL basics', 'Parameters prevent injection']::text[], 'import sqlite3

conn = sqlite3.connect("school.db")
cur = conn.cursor()

cur.execute("""CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    marks INTEGER
)""")

# safe: values are parameters, not joined text
cur.execute("INSERT INTO students (name, marks) VALUES (?, ?)", ("Riya", 88))
conn.commit()

for row in cur.execute("SELECT name, marks FROM students WHERE marks > ?", (50,)):
    print(row)

conn.close()', 'What can go wrong if you build an SQL query by joining strings with user input?', 'A text file is fine for a small list, but searching, updating one record, or handling two writers at once quickly becomes difficult. A database does this properly. SQLite is built into Python, needs no server, and stores everything in one f', 'Create a students table, insert five records, then write queries that list everyone who passed, update one student''s marks, and delete one record. Use parameters in every query.', 10, 10),
  (25, 'Testing & Debugging', 'Advanced', '5 hours', 24, FALSE, TRUE, ARRAY['Read the traceback', 'Write tests that fail first', 'Debug with evidence']::text[], 'import unittest

def average(marks):
    if not marks:
        return 0
    return sum(marks) / len(marks)

class TestAverage(unittest.TestCase):
    def test_normal(self):
        self.assertEqual(average([80, 90]), 85)

    def test_empty_list(self):
        # the edge case that would otherwise divide by zero
        self.assertEqual(average([]), 0)

    def test_single(self):
        self.assertEqual(average([73]), 73)

if __name__ == "__main__":
    unittest.main()', 'Why is an empty list worth its own test?', 'A traceback is not noise. Read it from the bottom: the last line names the error, and the lines above show the path that led there. Most beginner debugging time is lost by not reading the message that already explains the problem.', 'Write a function that returns the highest mark from a list. Then write at least four tests covering a normal list, a single item, an empty list and negative numbers. Make sure they all pass.', 10, 10),
  (26, 'Virtual Environments & Packaging', 'Advanced', '4 hours', 25, FALSE, TRUE, ARRAY['Isolate project dependencies', 'requirements.txt', 'Share code others can run']::text[], '# Terminal commands, not Python

# create an environment for this project
python -m venv venv

# activate it
# Windows:  venv\Scripts\activate
# macOS/Linux:  source venv/bin/activate

pip install requests
pip freeze > requirements.txt

# somebody else, later:
pip install -r requirements.txt', 'Why should the venv folder never be committed to version control?', 'Installing every library system-wide means two projects can need different versions of the same package and break each other. A virtual environment gives each project its own private set of packages, so they cannot interfere.', 'Create a virtual environment for a small project, install two packages, generate a requirements.txt, and write a README that explains in four steps how a classmate would run your project.', 10, 10)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  difficulty = EXCLUDED.difficulty,
  duration = EXCLUDED.duration,
  position = EXCLUDED.position,
  highlights = EXCLUDED.highlights,
  code_example = EXCLUDED.code_example,
  quiz_prompt = EXCLUDED.quiz_prompt,
  summary = EXCLUDED.summary,
  assignment_title = EXCLUDED.assignment_title,
  assignment_deadline_days = EXCLUDED.assignment_deadline_days,
  assignment_points = EXCLUDED.assignment_points,
  updated_at = now();

SELECT setval(pg_get_serial_sequence('public.units','id'), (SELECT MAX(id) FROM public.units));

-- The generated filler chapters are replaced wholesale by the real
-- writing. unit_progress is keyed on unit_id, not chapter id, so no
-- student progress is affected.
DELETE FROM public.chapters;

INSERT INTO public.chapters (unit_id, position, title, content) VALUES
  (1, 1, 'What Python is', 'Python is a high-level programming language designed to help humans write understandable instructions for computers. It focuses on readability, which means the code often looks close to natural logic. This is one reason it is widely used in schools, colleges, and beginner programming courses.'),
  (1, 2, 'A short history', 'Python was created by Guido van Rossum and released in the early 1990s. The language was built with the idea that code should be elegant, easy to read, and quick to write. Its design philosophy still influences how developers structure clean code today.'),
  (1, 3, 'Why Python is popular', 'Python is popular because one language can solve many kinds of problems. It is used in data science, machine learning, web development, automation, robotics, cybersecurity, and education. This makes it a powerful first language because the skill can be applied in many fields later.'),
  (1, 4, 'Interpreted programming idea', 'Python is often called an interpreted language because Python code is executed by the Python interpreter. This gives flexibility and makes testing code easy. You can run short snippets quickly, which is useful while learning, debugging, and experimenting with new ideas.'),
  (1, 5, 'Real-world usage', 'Python is used by startups, educators, researchers, and large companies. It helps automate repetitive tasks, build websites, analyze data, and create intelligent systems. A student learning Python is not learning just a classroom language, but a practical professional tool.'),
  (1, 6, 'First programming mindset', 'The first step in learning Python is understanding that programming is not only about syntax. It is about giving exact instructions. Even a simple print statement teaches input, output, execution, and the relationship between code and result.'),
  (2, 1, 'Meaning of variables', 'A variable stores data so that your program can use it later. Instead of repeating the same value everywhere, you assign it to a name. This makes code easier to understand, update, and debug.'),
  (2, 2, 'Main data types', 'The most common beginner data types are int, float, str, and bool. Integers store whole numbers, floats store decimal numbers, strings store text, and booleans store True or False.'),
  (2, 3, 'Dynamic typing', 'In Python, you usually do not declare the type manually before assigning a value. Python identifies the type automatically from the value you assign. This makes the language easier to start with, but you still need to understand the type of your data.'),
  (2, 4, 'Naming rules', 'Variable names should be meaningful. For example, student_name is much better than x. Good naming improves readability and helps others understand the purpose of each value without guessing.'),
  (2, 5, 'Type conversion', 'Sometimes programs must convert one type into another. For example, input() returns text, so if you want to add numbers from user input, you often need int() or float().'),
  (2, 6, 'Data modeling', 'Programs become stronger when variables represent real-world information properly. A fee system may use name, total_fee, paid_amount, and is_paid. This is the beginning of building real applications.'),
  (3, 1, 'Arithmetic operators', 'Arithmetic operators perform calculations like addition, subtraction, multiplication, division, modulus, floor division, and exponentiation. These are used in marks calculation, billing systems, and data processing tasks.'),
  (3, 2, 'Comparison operators', 'Comparison operators compare values and return True or False. They help a program decide whether one value is greater than, less than, equal to, or not equal to another.'),
  (3, 3, 'Logical operators', 'Logical operators combine conditions. and checks whether both conditions are true, or checks if at least one is true, and not reverses a condition. These are critical in login and validation systems.'),
  (3, 4, 'Assignment operators', 'Assignment operators store data and can update values quickly with shortcuts such as += and -=. These are useful for counters, totals, and loops.'),
  (3, 5, 'Membership operators', 'Membership operators such as in and not in check whether something exists inside a sequence. This is useful for searching lists, validating text, or checking categories.'),
  (3, 6, 'Operator precedence', 'When many operators appear in one expression, Python follows precedence rules. Multiplication usually happens before addition unless brackets force a different order. This matters for correct calculations.'),
  (4, 1, 'Why decisions matter', 'A program becomes useful when it reacts differently in different situations. Decision-making lets the program choose what to do based on user data, marks, permissions, or payment status.'),
  (4, 2, 'if statement', 'An if statement runs a block of code only if the condition is True. It is the foundation of logic in most programs and is often used for validation and flow control.'),
  (4, 3, 'else and elif', 'The else block runs if the if condition is false. elif allows multiple alternative conditions. Together they make multi-branch decision systems such as grade calculators and role-based access flows possible.'),
  (4, 4, 'Nested conditions', 'A condition can exist inside another condition. This is useful when one check depends on a previous one, for example verifying login first and then checking whether the user is admin.'),
  (4, 5, 'Truthy and falsy', 'Some values act as false even if they are not explicitly False, such as 0, an empty string, or an empty list. Understanding this helps simplify condition writing in Python.'),
  (4, 6, 'Writing readable logic', 'Good logic should be readable, not confusing. Long conditions should be broken into smaller named variables so that the program explains itself clearly.'),
  (5, 1, 'Why loops exist', 'Loops repeat actions efficiently. Without loops, many tasks would require writing the same statement again and again, which is slow and error-prone.'),
  (5, 2, 'for loop', 'A for loop is best when you want to repeat something over a list, string, or range. It is often used for iteration over known collections.'),
  (5, 3, 'while loop', 'A while loop repeats as long as a condition remains true. It is useful when the number of repetitions is unknown beforehand.'),
  (5, 4, 'break and continue', 'break stops the loop immediately, while continue skips the current iteration and moves to the next one. These tools give more control over repetition.'),
  (5, 5, 'Infinite loops', 'A while loop can become infinite if its condition never changes. This is why loop-control variables must be updated carefully.'),
  (5, 6, 'Practical repetition', 'Loops are used in attendance systems, result processing, games, menus, and automation scripts. They are one of the most important concepts in all programming.'),
  (6, 1, 'What a list is', 'A list is a collection that stores multiple values in order. Lists are flexible because they can be changed after creation, making them ideal for dynamic program data.'),
  (6, 2, 'Indexing', 'Each item in a list has an index starting from 0. Indexing allows direct access to specific values. Python also supports negative indexing to count from the end.'),
  (6, 3, 'Modifying lists', 'You can add, remove, and update items in a list. This makes lists useful for real-world data such as students, products, or menu items.'),
  (6, 4, 'Useful list methods', 'Methods like append(), remove(), insert(), pop(), and sort() help manage lists without rewriting complex logic.'),
  (6, 5, 'Slicing', 'Slicing extracts a part of a list. This is helpful when working with subsets, showing pages of content, or splitting grouped values.'),
  (6, 6, 'Lists in projects', 'Lists appear in almost every project. They are used to hold records, tasks, cart items, topics, scores, and more.'),
  (7, 1, 'Tuple basics', 'A tuple is like a list but cannot be changed after creation. It is useful when the stored data should remain fixed.'),
  (7, 2, 'Why immutability matters', 'Immutable data is harder to change accidentally. This gives tuples value when working with constants or protected grouped values.'),
  (7, 3, 'Set basics', 'A set stores unique elements only. Duplicate values are automatically removed, which makes sets useful for membership and uniqueness tasks.'),
  (7, 4, 'Set membership', 'Checking whether a value exists in a set is efficient. Sets are practical for validation, filtering, and duplicate removal.'),
  (7, 5, 'Set operations', 'Union, intersection, and difference help compare groups of values. These operations are useful in records, reports, and category comparisons.'),
  (7, 6, 'Choosing between structures', 'Lists, tuples, and sets each solve different problems. A good programmer chooses the right one based on whether order, uniqueness, or mutability is important.'),
  (8, 1, 'Dictionary concept', 'A dictionary stores information in key-value pairs. This is useful when data needs labels, such as name, age, marks, or city.'),
  (8, 2, 'Creating dictionaries', 'Dictionaries are created using curly braces. Each key must map to a related value, making the structure very readable for profile and record data.'),
  (8, 3, 'Accessing values', 'Values are accessed through keys instead of numeric indexes. This makes the meaning of the data clearer and reduces confusion.'),
  (8, 4, 'Updating and adding data', 'You can change existing values or add new keys easily. This makes dictionaries powerful for storing evolving information.'),
  (8, 5, 'Looping through dictionaries', 'Methods like keys(), values(), and items() allow iteration over dictionary content. This is important for printing reports or processing structured data.'),
  (8, 6, 'Nested data', 'Dictionaries can store lists or other dictionaries inside them. This helps represent more realistic systems such as complete student profiles.'),
  (9, 1, 'Why functions matter', 'Functions help break a large program into smaller reusable tasks. This avoids repetition and makes code easier to test and maintain.'),
  (9, 2, 'Defining functions', 'A function is defined using def. It receives a name and can contain a block of instructions that run only when the function is called.'),
  (9, 3, 'Parameters and arguments', 'Parameters allow a function to accept input. Arguments are the actual values passed when the function is called.'),
  (9, 4, 'Return values', 'A function can return a result to the caller. Returned values can then be stored, displayed, or used in calculations.'),
  (9, 5, 'Variable scope', 'Variables inside a function are generally local to that function. This helps avoid conflicts and keeps logic organized.'),
  (9, 6, 'Writing good functions', 'A good function usually performs one clear task. Smaller focused functions are easier to reuse and debug than one large confusing block.'),
  (10, 1, 'Reusing code through modules', 'A module is a Python file that contains code you want to reuse. Instead of placing everything in one file, you separate tasks into modules for clarity.'),
  (10, 2, 'Importing modules', 'Python allows you to import built-in or custom modules. This makes programs more organized and lets you access code from other files.'),
  (10, 3, 'Built-in libraries', 'Python provides many built-in modules such as math, random, and datetime. These save time because common tools are already available.'),
  (10, 4, 'Custom modules', 'You can create your own module simply by writing code in another file and importing it. This supports project growth and reuse.'),
  (10, 5, 'Packages and pip', 'A package is a collection of related modules. pip installs external packages, which expands what Python can do.'),
  (10, 6, 'Structured project thinking', 'Learning modules and packages teaches software organization. Professional code is rarely one giant file; it is separated into meaningful parts.'),
  (11, 1, 'File handling importance', 'Programs often need to save information permanently. File handling allows data to be stored even after the program closes.'),
  (11, 2, 'Opening files', 'Python uses open() to work with files. The mode tells Python whether you want to read, write, or append data.'),
  (11, 3, 'Reading data', 'Methods like read() and readline() load file content into the program. Once the text is loaded, you can process or display it.'),
  (11, 4, 'Writing and appending', 'Write mode replaces content, while append mode adds to existing content. Choosing the right mode is important to protect data.'),
  (11, 5, 'Using with', 'The with statement automatically closes the file when work is finished. This is the preferred and safest pattern in Python.'),
  (11, 6, 'Project usage', 'File handling is used in logs, saved notes, student records, exported reports, and many local applications.'),
  (12, 1, 'Why errors happen', 'Programs can fail because of invalid input, missing files, bad calculations, or unexpected conditions. Exception handling helps the program respond gracefully.'),
  (12, 2, 'try and except', 'The try block contains risky code and the except block handles problems if they happen. This avoids crashes and gives better control.'),
  (12, 3, 'finally', 'finally runs whether an error happened or not. It is useful for cleanup work such as closing files.'),
  (12, 4, 'Specific exceptions', 'Handling specific exceptions is better than catching everything blindly because different problems need different responses.'),
  (12, 5, 'Raising exceptions', 'A program can raise its own exception when rules are violated. This helps enforce business rules and validation.'),
  (12, 6, 'Better user experience', 'Error handling makes software more reliable and professional. It prevents unexpected crashes and guides the user clearly.'),
  (13, 1, 'Class concept', 'A class is a blueprint for creating objects. It defines what data and actions objects of that type should have.'),
  (13, 2, 'Objects', 'An object is a real instance created from a class. Many objects can come from the same class but hold different data.'),
  (13, 3, 'Attributes and methods', 'Attributes store information and methods define behavior. Together they make object-oriented design powerful and organized.'),
  (13, 4, '__init__ role', 'The __init__ method initializes a new object with starting values. It helps ensure every object begins in a valid state.'),
  (13, 5, 'self keyword', 'self refers to the current object. It allows methods to access and update that object''s own data.'),
  (13, 6, 'OOP in projects', 'OOP becomes useful when software grows. It helps model students, courses, accounts, products, or game characters clearly.'),
  (14, 1, 'Inheritance idea', 'Inheritance allows one class to reuse and extend the features of another class. This supports cleaner and less repetitive code.'),
  (14, 2, 'Parent and child classes', 'A child class inherits common behavior from a parent class and can also add special behavior of its own.'),
  (14, 3, 'Extending classes', 'A derived class can add new methods and attributes without rewriting the entire parent logic.'),
  (14, 4, 'Overriding methods', 'A child class may redefine a method from the parent class when specialized behavior is needed.'),
  (14, 5, 'super() usage', 'The super() function helps the child class reuse parent behavior, especially inside constructors.'),
  (14, 6, 'Design thinking', 'Inheritance should be used when there is a meaningful relationship such as Student is a Person or Dog is an Animal.'),
  (15, 1, 'Meaning of polymorphism', 'Polymorphism means the same interface can behave differently depending on the object using it. This creates flexible and reusable program designs.'),
  (15, 2, 'Method overriding example', 'If multiple classes define the same method name differently, the caller can still use one common method name and let the object decide behavior.'),
  (15, 3, 'Duck typing', 'Python often cares more about what an object can do than what type it officially is. If it behaves correctly, it can often be used.'),
  (15, 4, 'Why flexibility matters', 'Polymorphism reduces the need for large chains of if conditions checking object types. Each object can handle its own responsibility.'),
  (15, 5, 'Project examples', 'Notifications, payments, export tools, and game characters all benefit from polymorphism because one action may need different implementations.'),
  (15, 6, 'Design advantage', 'Programs designed with polymorphism are easier to extend because new classes can fit into old logic without major rewrites.'),
  (16, 1, 'Encapsulation', 'Encapsulation means keeping related data and methods together while controlling how that data is accessed. This protects important values from careless changes.'),
  (16, 2, 'Public and private style', 'Python uses naming conventions to show which attributes are intended for internal use. This helps developers understand class boundaries.'),
  (16, 3, 'Getters and setters', 'These methods provide controlled access to values. They can validate data before changing it.'),
  (16, 4, 'Abstraction', 'Abstraction hides unnecessary internal details and exposes only the useful interface. The caller uses the method without worrying about every step inside.'),
  (16, 5, 'Clean interfaces', 'A good interface is simple, small, and meaningful. Clear interfaces reduce confusion and make programs easier to maintain.'),
  (16, 6, 'Long-term software quality', 'Encapsulation and abstraction are important because they improve security, readability, and maintainability in bigger systems.'),
  (17, 1, 'Bringing everything together', 'A final project combines the concepts learned across the course into one complete program. This is where programming shifts from isolated practice to real problem solving.'),
  (17, 2, 'Planning first', 'Before coding, define the goal, inputs, outputs, features, and user flow. Planning reduces confusion and prevents many design mistakes.'),
  (17, 3, 'Build in small stages', 'The safest way to build a project is to start with a simple working version and improve it step by step.'),
  (17, 4, 'Test and debug', 'Projects always contain bugs. Debugging means checking assumptions, isolating the problem, and fixing it methodically.'),
  (17, 5, 'Presentation and documentation', 'A strong project is not only functional but also understandable. Clear naming, comments, and explanation matter.'),
  (17, 6, 'Portfolio value', 'A completed project becomes proof of skill. Good projects can later be shown in portfolios, interviews, or academic presentations.'),
  (18, 1, 'What a comprehension is', 'A list comprehension builds a list in a single line instead of writing a loop with append. It reads close to English: take every item in a sequence, do something to it, and collect the results. Once you can read one, a lot of real Python code becomes easier to follow.'),
  (18, 2, 'Filtering inside a comprehension', 'A comprehension can include a condition, so only some items are kept. This replaces the common pattern of a loop with an if inside it. For example, collecting only the students who passed, or only the even numbers from a list.'),
  (18, 3, 'Dictionary and set comprehensions', 'The same idea works for dictionaries and sets. A dictionary comprehension builds key and value pairs in one line, which is useful for turning two lists into a lookup table or for inverting an existing dictionary.'),
  (18, 4, 'What a lambda is', 'A lambda is a small function without a name, written in one line. It is used where a function is needed briefly, such as telling sort how to compare items. It cannot contain statements, only a single expression that it returns.'),
  (18, 5, 'Where lambdas actually help', 'Lambdas are most useful as the key argument to sorted, min, and max. Sorting students by marks, or files by size, becomes one clear line. Outside of these cases a normal def function is usually easier to read and to debug.'),
  (18, 6, 'Knowing when to stop', 'A comprehension that needs two conditions and a nested loop is harder to read than the loop it replaced. Python rewards clarity, not cleverness. If you have to pause to understand your own line, write it as an ordinary loop instead.'),
  (19, 1, 'What iteration really does', 'When you write a for loop, Python is not handing you the whole sequence at once. It asks the object for its next item repeatedly until there are none left. Understanding this explains why you can loop over a file, a range, or a dictionary in the same way.'),
  (19, 2, 'Iterators and the next function', 'An iterator is an object that remembers its position. Calling next on it returns the following item, and raises StopIteration when it is finished. A for loop is doing exactly this for you, with the exception handled quietly in the background.'),
  (19, 3, 'Why generators exist', 'Building a list of one million numbers uses a lot of memory. A generator produces values only when they are asked for, so memory stays small no matter how many items there are. This matters when reading large files or processing long streams of data.'),
  (19, 4, 'The yield keyword', 'A function that contains yield is a generator function. Instead of finishing and returning once, it pauses at each yield and continues from that point the next time a value is requested. Its local variables survive between pauses.'),
  (19, 5, 'Generator expressions', 'A generator expression looks like a list comprehension but uses round brackets. It gives the same lazy behaviour without writing a function. Passing one straight into sum or max avoids building an intermediate list entirely.'),
  (19, 6, 'Choosing between a list and a generator', 'Use a list when you need to look at items more than once, check the length, or index into it. Use a generator when you only need to pass through the data once and the data set is large. A generator is consumed after one pass.'),
  (20, 1, 'Functions are values', 'In Python a function can be stored in a variable, put in a list, and passed to another function. Nothing special happens when you do this. Once that idea is comfortable, decorators stop looking like magic and start looking like ordinary code.'),
  (20, 2, 'Higher-order functions', 'A higher-order function is one that takes a function as an argument or returns one. You have already used them: sorted takes a key function, and map takes a function to apply. Writing your own follows the same pattern.'),
  (20, 3, 'Wrapping a function', 'A wrapper is a function defined inside another function that calls the original and adds something around it, such as a timer or a log line. The outer function returns the wrapper instead of the original.'),
  (20, 4, 'The @ syntax', 'Putting @my_decorator above a def is a shortcut. Python calls the decorator with your function and replaces your function with whatever comes back. The two forms do exactly the same thing; the @ is only easier to read.'),
  (20, 5, 'Decorators with arguments', 'When the wrapper accepts *args and **kwargs it can wrap any function regardless of how many arguments that function takes. This is what makes a decorator reusable across a whole project rather than tied to one signature.'),
  (20, 6, 'Where you will meet them', 'Web frameworks use decorators to attach a URL to a function. Test libraries use them to mark tests. functools.wraps is used inside decorators so the wrapped function keeps its original name and docstring, which keeps error messages readable.'),
  (21, 1, 'The problem regex solves', 'Checking whether text follows a pattern using only string methods becomes long and fragile. A regular expression describes the shape of the text once, and the re module does the matching. Phone numbers, email addresses and dates are common examples.'),
  (21, 2, 'Basic building blocks', 'A regex is built from character classes such as \d for a digit and \w for a letter or digit, quantifiers such as + for one or more, and anchors such as ^ and $ for the start and end of the text. Combining these describes most everyday patterns.'),
  (21, 3, 'search, match and findall', 're.search looks anywhere in the string, re.match only checks the beginning, and re.findall returns every match as a list. Choosing the wrong one is the most common early mistake, especially match when search was intended.'),
  (21, 4, 'Groups and capturing', 'Round brackets create a group, letting you pull out part of a match. Parsing a date into day, month and year is a natural use. Named groups make the code readable when a pattern has several pieces.'),
  (21, 5, 'Replacing text', 're.sub replaces every match with something else, which is useful for cleaning data: removing extra spaces, masking phone numbers, or standardising separators before storing values in a database.'),
  (21, 6, 'When not to use regex', 'A regular expression is the wrong tool for structured formats such as HTML or JSON, which have proper parsers. A regex that nobody on the team can read is a liability. Always add a comment explaining what the pattern is supposed to match.'),
  (22, 1, 'Why dates need a module', 'Storing a date as plain text makes comparison and arithmetic painful. The datetime module gives real date and time objects that can be compared, subtracted and formatted correctly, including awareness of month lengths and leap years.'),
  (22, 2, 'date, time and datetime', 'date holds a calendar day, time holds a clock time, and datetime holds both. datetime.now gives the current moment. Picking the right one keeps your data honest: a birthday needs a date, an attendance stamp needs a datetime.'),
  (22, 3, 'Formatting with strftime', 'strftime turns a datetime into text using format codes, such as %d for day, %m for month and %Y for a four-digit year. This is how you display 09/08/2026 to a student while storing the real object underneath.'),
  (22, 4, 'Parsing with strptime', 'strptime does the reverse, reading text into a datetime using the same codes. It raises an error when the text does not match, which makes it a useful way to validate a date the user typed.'),
  (22, 5, 'timedelta and date arithmetic', 'Subtracting one datetime from another gives a timedelta, which reports the difference in days and seconds. Adding a timedelta moves a date forward, which is exactly how an assignment deadline ten days from today is calculated.'),
  (22, 6, 'Time zones, briefly', 'A naive datetime has no time zone and is fine for a single school. The moment data crosses regions, store times in UTC and convert only for display. Getting this wrong is a common source of off-by-a-few-hours bugs.'),
  (23, 1, 'What JSON is', 'JSON is a text format for structured data. It looks very close to a Python dictionary, which is why it feels familiar. Almost every web service sends and receives JSON, so reading it is a required skill for any connected program.'),
  (23, 2, 'json.loads and json.dumps', 'loads turns JSON text into Python objects, and dumps turns Python objects back into text. The names are worth remembering: the s stands for string. json.load and json.dump without the s work directly with files.'),
  (23, 3, 'What an API is', 'An API is a URL that returns data instead of a web page. You send a request, the server replies with a status code and a body. Understanding that this is the same HTTP your browser uses removes most of the mystery.'),
  (23, 4, 'Making a request', 'The requests library sends a GET request in one line and gives back a response object. response.json parses the body for you. Always look at response.status_code before trusting the body: 200 means success, 404 means not found.'),
  (23, 5, 'Handling failure', 'Networks fail. A request can time out, return an error code, or send back something that is not JSON. Wrap calls in try and except, always pass a timeout, and decide what your program should do when data does not arrive.'),
  (23, 6, 'Keys and safety', 'Many APIs need a key. That key must never be typed into your source code or pushed to GitHub. Read it from an environment variable instead, so the code can be shared safely while the secret stays on your machine.'),
  (24, 1, 'Why a file is not enough', 'A text file is fine for a small list, but searching, updating one record, or handling two writers at once quickly becomes difficult. A database does this properly. SQLite is built into Python, needs no server, and stores everything in one file.'),
  (24, 2, 'Tables, rows and columns', 'Data is stored in tables. A column has a name and a type, and each row is one record. Designing a table means deciding what a single row represents: one student, one attendance day, or one payment.'),
  (24, 3, 'Connecting and creating', 'sqlite3.connect opens a database file, creating it if needed. A cursor runs SQL statements. CREATE TABLE IF NOT EXISTS is the safe way to set up a table so the program can run more than once without failing.'),
  (24, 4, 'Insert, select, update, delete', 'These four statements cover most everyday work. SELECT with a WHERE clause is how you find records. Remember to call commit after changing data, or the changes are lost when the connection closes.'),
  (24, 5, 'Parameters, not string joining', 'Never build SQL by joining strings with user input. Someone can type SQL of their own and your query will run it. Use question-mark placeholders and pass values as a tuple; the library escapes them safely for you.'),
  (24, 6, 'Primary keys and relationships', 'A primary key uniquely identifies a row. A foreign key points at a row in another table, which is how a marks table links to a students table. This avoids repeating a student name in every single record.'),
  (25, 1, 'Reading a traceback', 'A traceback is not noise. Read it from the bottom: the last line names the error, and the lines above show the path that led there. Most beginner debugging time is lost by not reading the message that already explains the problem.'),
  (25, 2, 'Print, then something better', 'Printing a variable is a legitimate first step. When the problem is larger, the logging module lets you leave those messages in place and switch them on or off by level, instead of deleting them and adding them back later.'),
  (25, 3, 'What a unit test is', 'A unit test is a small function that runs your code with known input and checks the result. It turns "it seems to work" into something a computer can confirm every time you change the code.'),
  (25, 4, 'assert and the unittest module', 'assert checks that something is true and raises an error if not. The unittest module groups these checks into classes and reports which passed and which failed. pytest does the same with less ceremony.'),
  (25, 5, 'Testing edge cases', 'The interesting tests are not the ordinary ones. Empty lists, zero, negative numbers, missing keys and very large values are where bugs live. Write a test for the case you think cannot happen.'),
  (25, 6, 'Debugging as a method', 'Good debugging is not guessing. Reproduce the problem reliably, reduce the code until it is the smallest thing that still fails, form one hypothesis, and test it. Changing several things at once hides which change mattered.'),
  (26, 1, 'The problem with one global Python', 'Installing every library system-wide means two projects can need different versions of the same package and break each other. A virtual environment gives each project its own private set of packages, so they cannot interfere.'),
  (26, 2, 'Creating and activating', 'python -m venv venv creates the environment in a folder. Activating it changes which python and pip your terminal uses. The command differs slightly between Windows and Linux, which is worth noting when sharing instructions with classmates.'),
  (26, 3, 'Installing packages with pip', 'pip install adds a package into the active environment only. pip list shows what is installed. Because the environment is per-project, you can delete the folder and start again without touching anything else on your machine.'),
  (26, 4, 'requirements.txt', 'pip freeze writes the exact versions of everything installed into a file. Anyone who receives your project can run pip install -r requirements.txt and get the same setup. This is what makes a project reproducible.'),
  (26, 5, 'Structuring a project', 'A clear layout helps: source code in one folder, tests in another, a README explaining how to run it, and a .gitignore that excludes the venv folder and any secrets. Never commit the environment itself.'),
  (26, 6, 'Sharing your work', 'A project someone else can run in two commands is far more valuable than one that only works on your laptop. A short README with setup steps, a requirements file, and no hardcoded paths or keys is the standard to aim for.');

-- ========================================================= chapter progress
-- Progress was per unit only. Students need to see which chapter they are on
-- and which they have finished, so track completion per chapter as well.
CREATE TABLE IF NOT EXISTS public.chapter_progress (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id   UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  unit_id      INTEGER NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  completed    BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, chapter_id)
);
CREATE INDEX IF NOT EXISTS chapter_progress_user_idx
  ON public.chapter_progress (user_id, unit_id);

ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chapter_progress_own ON public.chapter_progress;
CREATE POLICY chapter_progress_own ON public.chapter_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chapter_progress TO authenticated;

-- Videos may now be attached to any unit, not just the original seventeen.
ALTER TABLE public.unit_videos DROP CONSTRAINT IF EXISTS unit_videos_unit_id_check;
