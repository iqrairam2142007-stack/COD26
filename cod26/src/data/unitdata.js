/**
 * Frontend unit catalogue. Metadata + theory pages only.
 * Quiz questions and correct answers live in the database and are never
 * shipped to the browser - see the `quiz` edge function.
 */

const U = (id, title, difficulty, duration, summary) => ({
  id,
  title,
  difficulty,
  duration,
  pages: [
    { pageNum: 1, title: "Overview", content: summary },
    {
      pageNum: 2,
      title: "In practice",
      content:
        `Work through the examples for "${title}" in your own editor. ` +
        "Type every snippet by hand - reading code is not the same as writing it.",
    },
    {
      pageNum: 3,
      title: "Common mistakes",
      content:
        "Re-read the error messages you hit. Most beginner bugs in this unit come from " +
        "assuming the code did what you meant rather than what you wrote.",
    },
  ],
  assignment: {
    title: `${title} - practice set`,
    deadline: 7,
    pointValue: 10,
  },
});

export const unitData = [
  U(1, "Introduction to Python", "Beginner", "4 hours",
    "Python is a high-level, interpreted language designed around readability. You will install it, run your first script, and understand what the interpreter actually does."),
  U(2, "Variables, Data Types and Operations", "Beginner", "5 hours",
    "Names bind to objects. Learn int, float, str, bool, how Python infers types, and how arithmetic and comparison operators behave."),
  U(3, "Control Flow - Conditional Statements", "Beginner", "4 hours",
    "if / elif / else, truthiness, and how indentation - not braces - defines a block in Python."),
  U(4, "Loops - for and while", "Beginner", "5 hours",
    "Iterate over sequences with for, repeat on a condition with while, and control both with break, continue and else."),
  U(5, "Functions and Scope", "Beginner", "6 hours",
    "Define reusable behaviour, pass arguments positionally and by keyword, return values, and understand local vs global scope."),
  U(6, "Lists and List Operations", "Beginner", "5 hours",
    "Ordered, mutable sequences: indexing, slicing, appending, sorting, and list comprehensions."),
  U(7, "Tuples, Sets and Dictionaries", "Beginner", "5 hours",
    "Immutable tuples, unique-membership sets, and key/value dictionaries - and when each is the right choice."),
  U(8, "Working with Strings", "Beginner", "4 hours",
    "Strings are immutable sequences. Slicing, f-strings, split/join, and the methods you will reach for daily."),
  U(9, "File I/O and Exception Handling", "Intermediate", "6 hours",
    "Read and write files with context managers, and handle failure with try / except / finally instead of crashing."),
  U(10, "Introduction to OOP", "Intermediate", "6 hours",
    "Classes bundle data and behaviour. Learn __init__, instance attributes, and methods."),
  U(11, "Inheritance and Polymorphism", "Intermediate", "5 hours",
    "Reuse behaviour across classes, override methods, and let one interface serve many types."),
  U(12, "Encapsulation and Abstraction", "Intermediate", "4 hours",
    "Hide internal state behind a stable interface using properties and naming conventions."),
  U(13, "Modules and Packages", "Intermediate", "4 hours",
    "Split code across files, import it, and understand what __name__ == '__main__' is doing."),
  U(14, "Working with Libraries", "Advanced", "6 hours",
    "pip, virtual environments, and the standard-library modules worth knowing before reaching for a dependency."),
  U(15, "Web Development Basics", "Advanced", "7 hours",
    "HTTP, requests and responses, and serving a first small web application from Python."),
  U(16, "Database Concepts and SQL", "Advanced", "7 hours",
    "Tables, keys, joins, and querying a relational database from Python."),
  U(17, "Capstone and Professional Development", "Advanced", "8 hours",
    "Combine everything into one project, put it under version control, and write a README somebody else can follow."),
];

export function getUnitById(id) {
  return unitData.find((u) => u.id === Number(id));
}

export const TOTAL_UNITS = unitData.length;

export default unitData;
