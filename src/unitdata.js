const baseUnitdata = [
  {
    id: 1,
    title: 'Introduction to Python',
    highlights: ['Readable syntax', 'Beginner friendly', 'Used in AI, web, automation'],
    pages: [
      `Page 1 - What Python is\n\nPython is a high-level programming language designed to help humans write understandable instructions for computers. It focuses on readability, which means the code often looks close to natural logic. This is one reason it is widely used in schools, colleges, and beginner programming courses.`,
      `Page 2 - A short history\n\nPython was created by Guido van Rossum and released in the early 1990s. The language was built with the idea that code should be elegant, easy to read, and quick to write. Its design philosophy still influences how developers structure clean code today.`,
      `Page 3 - Why Python is popular\n\nPython is popular because one language can solve many kinds of problems. It is used in data science, machine learning, web development, automation, robotics, cybersecurity, and education. This makes it a powerful first language because the skill can be applied in many fields later.`,
      `Page 4 - Interpreted programming idea\n\nPython is often called an interpreted language because Python code is executed by the Python interpreter. This gives flexibility and makes testing code easy. You can run short snippets quickly, which is useful while learning, debugging, and experimenting with new ideas.`,
      `Page 5 - Real-world usage\n\nPython is used by startups, educators, researchers, and large companies. It helps automate repetitive tasks, build websites, analyze data, and create intelligent systems. A student learning Python is not learning just a classroom language, but a practical professional tool.`,
      `Page 6 - First programming mindset\n\nThe first step in learning Python is understanding that programming is not only about syntax. It is about giving exact instructions. Even a simple print statement teaches input, output, execution, and the relationship between code and result.`
    ],
    codeExample: `# Your first Python program\nprint("Hello, COD26!")\n\n# A comment explains what the program does\nprint("Python is a beginner-friendly language.")`,
    quiz: 'Why is Python considered a good first programming language?',
    assignment: 'Write a short Python program that prints your name, your goal, and one reason you want to learn Python.'
  },
  {
    id: 2,
    title: 'Variables & Data Types',
    highlights: ['Store information', 'Strings, integers, floats, booleans', 'Meaningful names matter'],
    pages: [
      `Page 1 - Meaning of variables\n\nA variable stores data so that your program can use it later. Instead of repeating the same value everywhere, you assign it to a name. This makes code easier to understand, update, and debug.`,
      `Page 2 - Main data types\n\nThe most common beginner data types are int, float, str, and bool. Integers store whole numbers, floats store decimal numbers, strings store text, and booleans store True or False.`,
      `Page 3 - Dynamic typing\n\nIn Python, you usually do not declare the type manually before assigning a value. Python identifies the type automatically from the value you assign. This makes the language easier to start with, but you still need to understand the type of your data.`,
      `Page 4 - Naming rules\n\nVariable names should be meaningful. For example, student_name is much better than x. Good naming improves readability and helps others understand the purpose of each value without guessing.`,
      `Page 5 - Type conversion\n\nSometimes programs must convert one type into another. For example, input() returns text, so if you want to add numbers from user input, you often need int() or float().`,
      `Page 6 - Data modeling\n\nPrograms become stronger when variables represent real-world information properly. A fee system may use name, total_fee, paid_amount, and is_paid. This is the beginning of building real applications.`
    ],
    codeExample: `student_name = "Riya"\nage = 15\npercentage = 89.5\nis_active = True\n\nprint(student_name)\nprint(type(age))\nprint(type(percentage))\nprint(type(is_active))`,
    quiz: 'What is the difference between a string and an integer?',
    assignment: 'Create variables for your name, age, favorite subject, and school/college, then print all of them clearly.'
  },
  {
    id: 3,
    title: 'Operators',
    highlights: ['Arithmetic', 'Comparison', 'Logical', 'Membership'],
    pages: [
      `Page 1 - Arithmetic operators\n\nArithmetic operators perform calculations like addition, subtraction, multiplication, division, modulus, floor division, and exponentiation. These are used in marks calculation, billing systems, and data processing tasks.`,
      `Page 2 - Comparison operators\n\nComparison operators compare values and return True or False. They help a program decide whether one value is greater than, less than, equal to, or not equal to another.`,
      `Page 3 - Logical operators\n\nLogical operators combine conditions. and checks whether both conditions are true, or checks if at least one is true, and not reverses a condition. These are critical in login and validation systems.`,
      `Page 4 - Assignment operators\n\nAssignment operators store data and can update values quickly with shortcuts such as += and -=. These are useful for counters, totals, and loops.`,
      `Page 5 - Membership operators\n\nMembership operators such as in and not in check whether something exists inside a sequence. This is useful for searching lists, validating text, or checking categories.`,
      `Page 6 - Operator precedence\n\nWhen many operators appear in one expression, Python follows precedence rules. Multiplication usually happens before addition unless brackets force a different order. This matters for correct calculations.`
    ],
    codeExample: `a = 10\nb = 3\n\nprint(a + b)\nprint(a > b)\nprint(a % b)\nprint(a > 5 and b < 5)\nprint("py" in "python")`,
    quiz: 'Why do comparison operators usually return True or False?',
    assignment: 'Build a mini calculator that shows arithmetic results for two numbers.'
  },
  {
    id: 4,
    title: 'Control Flow: If/Else',
    highlights: ['Decision making', 'if, elif, else', 'Truthy and falsy values'],
    pages: [
      `Page 1 - Why decisions matter\n\nA program becomes useful when it reacts differently in different situations. Decision-making lets the program choose what to do based on user data, marks, permissions, or payment status.`,
      `Page 2 - if statement\n\nAn if statement runs a block of code only if the condition is True. It is the foundation of logic in most programs and is often used for validation and flow control.`,
      `Page 3 - else and elif\n\nThe else block runs if the if condition is false. elif allows multiple alternative conditions. Together they make multi-branch decision systems such as grade calculators and role-based access flows possible.`,
      `Page 4 - Nested conditions\n\nA condition can exist inside another condition. This is useful when one check depends on a previous one, for example verifying login first and then checking whether the user is admin.`,
      `Page 5 - Truthy and falsy\n\nSome values act as false even if they are not explicitly False, such as 0, an empty string, or an empty list. Understanding this helps simplify condition writing in Python.`,
      `Page 6 - Writing readable logic\n\nGood logic should be readable, not confusing. Long conditions should be broken into smaller named variables so that the program explains itself clearly.`
    ],
    codeExample: `marks = 82\n\nif marks >= 90:\n    print("Grade A+")\nelif marks >= 75:\n    print("Grade A")\nelif marks >= 40:\n    print("Pass")\nelse:\n    print("Fail")`,
    quiz: 'When should you use elif in a program?',
    assignment: 'Create a grade system using if, elif, and else.'
  },
  {
    id: 5,
    title: 'Loops: For/While',
    highlights: ['Repetition', 'for loop', 'while loop', 'break and continue'],
    pages: [
      `Page 1 - Why loops exist\n\nLoops repeat actions efficiently. Without loops, many tasks would require writing the same statement again and again, which is slow and error-prone.`,
      `Page 2 - for loop\n\nA for loop is best when you want to repeat something over a list, string, or range. It is often used for iteration over known collections.`,
      `Page 3 - while loop\n\nA while loop repeats as long as a condition remains true. It is useful when the number of repetitions is unknown beforehand.`,
      `Page 4 - break and continue\n\nbreak stops the loop immediately, while continue skips the current iteration and moves to the next one. These tools give more control over repetition.`,
      `Page 5 - Infinite loops\n\nA while loop can become infinite if its condition never changes. This is why loop-control variables must be updated carefully.`,
      `Page 6 - Practical repetition\n\nLoops are used in attendance systems, result processing, games, menus, and automation scripts. They are one of the most important concepts in all programming.`
    ],
    codeExample: `for number in range(1, 6):\n    print("For loop:", number)\n\ncount = 1\nwhile count <= 3:\n    print("While loop:", count)\n    count += 1`,
    quiz: 'What is one major difference between a for loop and a while loop?',
    assignment: 'Print numbers from 1 to 10 using both a for loop and a while loop.'
  },
  {
    id: 6,
    title: 'Data Structures: Lists',
    highlights: ['Ordered collection', 'Mutable', 'Indexing', 'Methods'],
    pages: [
      `Page 1 - What a list is\n\nA list is a collection that stores multiple values in order. Lists are flexible because they can be changed after creation, making them ideal for dynamic program data.`,
      `Page 2 - Indexing\n\nEach item in a list has an index starting from 0. Indexing allows direct access to specific values. Python also supports negative indexing to count from the end.`,
      `Page 3 - Modifying lists\n\nYou can add, remove, and update items in a list. This makes lists useful for real-world data such as students, products, or menu items.`,
      `Page 4 - Useful list methods\n\nMethods like append(), remove(), insert(), pop(), and sort() help manage lists without rewriting complex logic.`,
      `Page 5 - Slicing\n\nSlicing extracts a part of a list. This is helpful when working with subsets, showing pages of content, or splitting grouped values.`,
      `Page 6 - Lists in projects\n\nLists appear in almost every project. They are used to hold records, tasks, cart items, topics, scores, and more.`
    ],
    codeExample: `fruits = ["apple", "banana", "mango"]\nfruits.append("orange")\nfruits[1] = "grapes"\nprint(fruits)\nprint(fruits[0])\nprint(fruits[1:3])`,
    quiz: 'Why are lists called mutable?',
    assignment: 'Create a list of your favorite subjects, then add and remove one item.'
  },
  {
    id: 7,
    title: 'Tuples & Sets',
    highlights: ['Tuple is fixed', 'Set keeps unique values', 'Set operations'],
    pages: [
      `Page 1 - Tuple basics\n\nA tuple is like a list but cannot be changed after creation. It is useful when the stored data should remain fixed.`,
      `Page 2 - Why immutability matters\n\nImmutable data is harder to change accidentally. This gives tuples value when working with constants or protected grouped values.`,
      `Page 3 - Set basics\n\nA set stores unique elements only. Duplicate values are automatically removed, which makes sets useful for membership and uniqueness tasks.`,
      `Page 4 - Set membership\n\nChecking whether a value exists in a set is efficient. Sets are practical for validation, filtering, and duplicate removal.`,
      `Page 5 - Set operations\n\nUnion, intersection, and difference help compare groups of values. These operations are useful in records, reports, and category comparisons.`,
      `Page 6 - Choosing between structures\n\nLists, tuples, and sets each solve different problems. A good programmer chooses the right one based on whether order, uniqueness, or mutability is important.`
    ],
    codeExample: `colors = ("red", "green", "blue")\nsubjects = {"Math", "Science", "Math", "English"}\nprint(colors)\nprint(subjects)\nprint("Science" in subjects)`,
    quiz: 'Why would you choose a set instead of a list in some situations?',
    assignment: 'Create two sets and find their union and intersection.'
  },
  {
    id: 8,
    title: 'Dictionaries',
    highlights: ['Key-value pairs', 'Fast access', 'Mutable structure'],
    pages: [
      `Page 1 - Dictionary concept\n\nA dictionary stores information in key-value pairs. This is useful when data needs labels, such as name, age, marks, or city.`,
      `Page 2 - Creating dictionaries\n\nDictionaries are created using curly braces. Each key must map to a related value, making the structure very readable for profile and record data.`,
      `Page 3 - Accessing values\n\nValues are accessed through keys instead of numeric indexes. This makes the meaning of the data clearer and reduces confusion.`,
      `Page 4 - Updating and adding data\n\nYou can change existing values or add new keys easily. This makes dictionaries powerful for storing evolving information.`,
      `Page 5 - Looping through dictionaries\n\nMethods like keys(), values(), and items() allow iteration over dictionary content. This is important for printing reports or processing structured data.`,
      `Page 6 - Nested data\n\nDictionaries can store lists or other dictionaries inside them. This helps represent more realistic systems such as complete student profiles.`
    ],
    codeExample: `student = {\n    "name": "Riya",\n    "marks": 92,\n    "city": "Delhi"\n}\n\nstudent["marks"] = 95\nprint(student["name"])\nprint(student)`,
    quiz: 'Why are dictionaries useful for profile data?',
    assignment: 'Create a dictionary with your name, course, city, and score.'
  },
  {
    id: 9,
    title: 'Functions',
    highlights: ['Reusable logic', 'Parameters', 'Return values', 'Scope'],
    pages: [
      `Page 1 - Why functions matter\n\nFunctions help break a large program into smaller reusable tasks. This avoids repetition and makes code easier to test and maintain.`,
      `Page 2 - Defining functions\n\nA function is defined using def. It receives a name and can contain a block of instructions that run only when the function is called.`,
      `Page 3 - Parameters and arguments\n\nParameters allow a function to accept input. Arguments are the actual values passed when the function is called.`,
      `Page 4 - Return values\n\nA function can return a result to the caller. Returned values can then be stored, displayed, or used in calculations.`,
      `Page 5 - Variable scope\n\nVariables inside a function are generally local to that function. This helps avoid conflicts and keeps logic organized.`,
      `Page 6 - Writing good functions\n\nA good function usually performs one clear task. Smaller focused functions are easier to reuse and debug than one large confusing block.`
    ],
    codeExample: `def greet(name):\n    return f"Hello, {name}!"\n\nmessage = greet("COD26 Student")\nprint(message)`,
    quiz: 'What is the benefit of returning a value from a function?',
    assignment: 'Write a function that takes two numbers and returns their product.'
  },
  {
    id: 10,
    title: 'Modules & Packages',
    highlights: ['Code organization', 'Importing', 'Built-in modules', 'pip'],
    pages: [
      `Page 1 - Reusing code through modules\n\nA module is a Python file that contains code you want to reuse. Instead of placing everything in one file, you separate tasks into modules for clarity.`,
      `Page 2 - Importing modules\n\nPython allows you to import built-in or custom modules. This makes programs more organized and lets you access code from other files.`,
      `Page 3 - Built-in libraries\n\nPython provides many built-in modules such as math, random, and datetime. These save time because common tools are already available.`,
      `Page 4 - Custom modules\n\nYou can create your own module simply by writing code in another file and importing it. This supports project growth and reuse.`,
      `Page 5 - Packages and pip\n\nA package is a collection of related modules. pip installs external packages, which expands what Python can do.`,
      `Page 6 - Structured project thinking\n\nLearning modules and packages teaches software organization. Professional code is rarely one giant file; it is separated into meaningful parts.`
    ],
    codeExample: `import math\nimport random\n\nprint(math.sqrt(25))\nprint(random.randint(1, 10))`,
    quiz: 'What is the difference between a module and a package?',
    assignment: 'Import the math module and print the square root of a number.'
  },
  {
    id: 11,
    title: 'File Handling',
    highlights: ['Read files', 'Write files', 'Append mode', 'Context manager'],
    pages: [
      `Page 1 - File handling importance\n\nPrograms often need to save information permanently. File handling allows data to be stored even after the program closes.`,
      `Page 2 - Opening files\n\nPython uses open() to work with files. The mode tells Python whether you want to read, write, or append data.`,
      `Page 3 - Reading data\n\nMethods like read() and readline() load file content into the program. Once the text is loaded, you can process or display it.`,
      `Page 4 - Writing and appending\n\nWrite mode replaces content, while append mode adds to existing content. Choosing the right mode is important to protect data.`,
      `Page 5 - Using with\n\nThe with statement automatically closes the file when work is finished. This is the preferred and safest pattern in Python.`,
      `Page 6 - Project usage\n\nFile handling is used in logs, saved notes, student records, exported reports, and many local applications.`
    ],
    codeExample: `with open("notes.txt", "w") as file:\n    file.write("COD26 Python notes")\n\nwith open("notes.txt", "r") as file:\n    print(file.read())`,
    quiz: 'Why is with open(...) recommended in Python?',
    assignment: 'Create a text file, write your goals into it, then read and print the content.'
  },
  {
    id: 12,
    title: 'Exception Handling',
    highlights: ['try', 'except', 'finally', 'Error safety'],
    pages: [
      `Page 1 - Why errors happen\n\nPrograms can fail because of invalid input, missing files, bad calculations, or unexpected conditions. Exception handling helps the program respond gracefully.`,
      `Page 2 - try and except\n\nThe try block contains risky code and the except block handles problems if they happen. This avoids crashes and gives better control.`,
      `Page 3 - finally\n\nfinally runs whether an error happened or not. It is useful for cleanup work such as closing files.`,
      `Page 4 - Specific exceptions\n\nHandling specific exceptions is better than catching everything blindly because different problems need different responses.`,
      `Page 5 - Raising exceptions\n\nA program can raise its own exception when rules are violated. This helps enforce business rules and validation.`,
      `Page 6 - Better user experience\n\nError handling makes software more reliable and professional. It prevents unexpected crashes and guides the user clearly.`
    ],
    codeExample: `try:\n    number = int(input("Enter a number: "))\n    print(10 / number)\nexcept ValueError:\n    print("Please enter a valid integer.")\nexcept ZeroDivisionError:\n    print("Zero is not allowed here.")`,
    quiz: 'Why should specific exceptions be handled separately?',
    assignment: 'Write a safe division program that handles invalid input and zero division.'
  },
  {
    id: 13,
    title: 'OOP: Classes & Objects',
    highlights: ['Blueprint and instance', 'Attributes', 'Methods', '__init__'],
    pages: [
      `Page 1 - Class concept\n\nA class is a blueprint for creating objects. It defines what data and actions objects of that type should have.`,
      `Page 2 - Objects\n\nAn object is a real instance created from a class. Many objects can come from the same class but hold different data.`,
      `Page 3 - Attributes and methods\n\nAttributes store information and methods define behavior. Together they make object-oriented design powerful and organized.`,
      `Page 4 - __init__ role\n\nThe __init__ method initializes a new object with starting values. It helps ensure every object begins in a valid state.`,
      `Page 5 - self keyword\n\nself refers to the current object. It allows methods to access and update that object's own data.`,
      `Page 6 - OOP in projects\n\nOOP becomes useful when software grows. It helps model students, courses, accounts, products, or game characters clearly.`
    ],
    codeExample: `class Student:\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks\n\n    def show_details(self):\n        print(self.name, self.marks)\n\nstudent1 = Student("Riya", 91)\nstudent1.show_details()`,
    quiz: 'What is the relationship between a class and an object?',
    assignment: 'Create a Book or Student class with attributes and one display method.'
  },
  {
    id: 14,
    title: 'Inheritance',
    highlights: ['Parent and child classes', 'Code reuse', 'Method override', 'super()'],
    pages: [
      `Page 1 - Inheritance idea\n\nInheritance allows one class to reuse and extend the features of another class. This supports cleaner and less repetitive code.`,
      `Page 2 - Parent and child classes\n\nA child class inherits common behavior from a parent class and can also add special behavior of its own.`,
      `Page 3 - Extending classes\n\nA derived class can add new methods and attributes without rewriting the entire parent logic.`,
      `Page 4 - Overriding methods\n\nA child class may redefine a method from the parent class when specialized behavior is needed.`,
      `Page 5 - super() usage\n\nThe super() function helps the child class reuse parent behavior, especially inside constructors.`,
      `Page 6 - Design thinking\n\nInheritance should be used when there is a meaningful relationship such as Student is a Person or Dog is an Animal.`
    ],
    codeExample: `class Person:\n    def __init__(self, name):\n        self.name = name\n\nclass Student(Person):\n    def __init__(self, name, course):\n        super().__init__(name)\n        self.course = course\n\nstudent = Student("Riya", "Python")\nprint(student.name, student.course)`,
    quiz: 'Why is inheritance helpful in object-oriented programming?',
    assignment: 'Create a Person class and a Student class that inherits from it.'
  },
  {
    id: 15,
    title: 'Polymorphism',
    highlights: ['Same method, different behavior', 'Flexibility', 'Duck typing'],
    pages: [
      `Page 1 - Meaning of polymorphism\n\nPolymorphism means the same interface can behave differently depending on the object using it. This creates flexible and reusable program designs.`,
      `Page 2 - Method overriding example\n\nIf multiple classes define the same method name differently, the caller can still use one common method name and let the object decide behavior.`,
      `Page 3 - Duck typing\n\nPython often cares more about what an object can do than what type it officially is. If it behaves correctly, it can often be used.`,
      `Page 4 - Why flexibility matters\n\nPolymorphism reduces the need for large chains of if conditions checking object types. Each object can handle its own responsibility.`,
      `Page 5 - Project examples\n\nNotifications, payments, export tools, and game characters all benefit from polymorphism because one action may need different implementations.`,
      `Page 6 - Design advantage\n\nPrograms designed with polymorphism are easier to extend because new classes can fit into old logic without major rewrites.`
    ],
    codeExample: `class Dog:\n    def speak(self):\n        return "Bark"\n\nclass Cat:\n    def speak(self):\n        return "Meow"\n\nfor animal in [Dog(), Cat()]:\n    print(animal.speak())`,
    quiz: 'How does polymorphism reduce complexity in programs?',
    assignment: 'Create two classes with the same method name and show how each object behaves differently.'
  },
  {
    id: 16,
    title: 'Encapsulation & Abstraction',
    highlights: ['Protect data', 'Hide details', 'Use clear interfaces'],
    pages: [
      `Page 1 - Encapsulation\n\nEncapsulation means keeping related data and methods together while controlling how that data is accessed. This protects important values from careless changes.`,
      `Page 2 - Public and private style\n\nPython uses naming conventions to show which attributes are intended for internal use. This helps developers understand class boundaries.`,
      `Page 3 - Getters and setters\n\nThese methods provide controlled access to values. They can validate data before changing it.`,
      `Page 4 - Abstraction\n\nAbstraction hides unnecessary internal details and exposes only the useful interface. The caller uses the method without worrying about every step inside.`,
      `Page 5 - Clean interfaces\n\nA good interface is simple, small, and meaningful. Clear interfaces reduce confusion and make programs easier to maintain.`,
      `Page 6 - Long-term software quality\n\nEncapsulation and abstraction are important because they improve security, readability, and maintainability in bigger systems.`
    ],
    codeExample: `class BankAccount:\n    def __init__(self, balance):\n        self.__balance = balance\n\n    def deposit(self, amount):\n        if amount > 0:\n            self.__balance += amount\n\n    def get_balance(self):\n        return self.__balance\n\naccount = BankAccount(1000)\naccount.deposit(500)\nprint(account.get_balance())`,
    quiz: 'Why is abstraction useful in software design?',
    assignment: 'Create a small class that keeps one value private and updates it using methods.'
  },
  {
    id: 17,
    title: 'Final Projects',
    highlights: ['Planning', 'Step-by-step building', 'Debugging', 'Portfolio mindset'],
    pages: [
      `Page 1 - Bringing everything together\n\nA final project combines the concepts learned across the course into one complete program. This is where programming shifts from isolated practice to real problem solving.`,
      `Page 2 - Planning first\n\nBefore coding, define the goal, inputs, outputs, features, and user flow. Planning reduces confusion and prevents many design mistakes.`,
      `Page 3 - Build in small stages\n\nThe safest way to build a project is to start with a simple working version and improve it step by step.`,
      `Page 4 - Test and debug\n\nProjects always contain bugs. Debugging means checking assumptions, isolating the problem, and fixing it methodically.`,
      `Page 5 - Presentation and documentation\n\nA strong project is not only functional but also understandable. Clear naming, comments, and explanation matter.`,
      `Page 6 - Portfolio value\n\nA completed project becomes proof of skill. Good projects can later be shown in portfolios, interviews, or academic presentations.`
    ],
    codeExample: `project_name = "Student Record Manager"\nfeatures = ["Add student", "View student", "Update marks"]\n\nprint("Project:", project_name)\nfor feature in features:\n    print("-", feature)`,
    quiz: 'Why is project planning important before writing code?',
    assignment: 'Design and build a mini project such as a quiz app, student record system, attendance tool, or calculator and prepare it for submission.'
  }
];

const buildVideoLesson = (unit) => ({
  title: `${unit.title} - AI Video Classroom`,
  duration: '6 to 8 minutes',
  summary: `This AI-generated classroom lesson explains ${unit.title} in depth, builds conceptual clarity, and connects the theory to a practical assignment that students must complete within 10 days.`,
  scenes: [
    {
      headline: `Introduction to ${unit.title}`,
      narration: unit.pages[0],
      takeaway: unit.highlights?.[0] || unit.title
    },
    {
      headline: `Deep Explanation of ${unit.title}`,
      narration: unit.pages[1],
      takeaway: unit.highlights?.[1] || 'Understand the core concept clearly'
    },
    {
      headline: `${unit.title} Worked Example`,
      narration: `${unit.pages[2]}\n\nExample Walkthrough:\n${unit.codeExample}`,
      takeaway: unit.highlights?.[2] || 'Connect theory with practice'
    },
    {
      headline: `${unit.title} Practice and Assignment Guide`,
      narration: `${unit.pages[3]}\n\nAssignment Brief:\n${unit.assignment}`,
      takeaway: 'Complete the assignment within the allotted 10-day window'
    }
  ],
  prompt: `Create an educational COD26 AI classroom lesson for ${unit.title}. Explain the topic deeply, use an easy classroom teaching style, include one worked example, and end with assignment guidance that must be completed within 10 days.`
});

export const unitdata = baseUnitdata.map((unit) => ({
  ...unit,
  theoryTopic: `Theory Topic: ${unit.title}`,
  assignmentWindowDays: 10,
  assignmentBrief: `Study the theory carefully, review the example, and complete the assignment within 10 days from the date it is allotted.`,
  videoLesson: buildVideoLesson(unit)
}));
