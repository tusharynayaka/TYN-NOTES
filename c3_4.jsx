export default function CProgrammingQAWebsite() {
  const data = [
    {
      title: "Strings",
      items: [
        {
          q: "What is a string in C?",
          a: "A string in C is a collection of characters terminated by a null character '\\0'. Example: char str[] = \"Hello\";"
        },
        {
          q: "Difference between char array and string literal?",
          a: "Character arrays are mutable while string literals are generally stored in read-only memory."
        },
        {
          q: "What is null termination?",
          a: "The null character '\\0' marks the end of a string in C."
        },
        {
          q: "Write logic to reverse a string.",
          a: "Use two pointers or indexes: one from start and another from end, then swap characters until middle is reached."
        }
      ]
    },
    {
      title: "String Manipulation Functions",
      items: [
        {
          q: "What does strcpy() do?",
          a: "strcpy() copies one string into another including the null character."
        },
        {
          q: "Difference between strcat() and strncat()?",
          a: "strcat() appends entire string while strncat() appends only specified number of characters."
        },
        {
          q: "Explain strcmp().",
          a: "strcmp() compares two strings lexicographically and returns 0 if equal."
        },
        {
          q: "What is buffer overflow?",
          a: "Buffer overflow occurs when more data is written than allocated memory size."
        }
      ]
    },
    {
      title: "Command Line Arguments",
      items: [
        {
          q: "What are command line arguments?",
          a: "Arguments passed while executing a program are called command line arguments."
        },
        {
          q: "Explain argc and argv.",
          a: "argc stores argument count and argv stores argument values as strings."
        },
        {
          q: "What is argv[0]?",
          a: "argv[0] contains the program name."
        },
        {
          q: "How to convert command line argument to integer?",
          a: "Use atoi() function from stdlib.h."
        }
      ]
    },
    {
      title: "Dynamic Memory Allocation",
      items: [
        {
          q: "What is malloc()?",
          a: "malloc() allocates a block of memory dynamically and returns void pointer."
        },
        {
          q: "Difference between malloc() and calloc()?",
          a: "malloc() allocates uninitialized memory while calloc() initializes memory with zero."
        },
        {
          q: "What is realloc()?",
          a: "realloc() changes the size of previously allocated memory block."
        },
        {
          q: "What is memory leak?",
          a: "Memory leak occurs when dynamically allocated memory is not freed using free()."
        }
      ]
    },
    {
      title: "Structures",
      items: [
        {
          q: "What is a structure?",
          a: "Structure is a user-defined data type that groups variables of different data types."
        },
        {
          q: "What is nested structure?",
          a: "A structure inside another structure is called nested structure."
        },
        {
          q: "What is structure padding?",
          a: "Extra unused bytes added by compiler for alignment are called structure padding."
        },
        {
          q: "Difference between structure and union?",
          a: "Structures allocate separate memory for members while unions share same memory among members."
        }
      ]
    },
    {
      title: "#pragma Directive",
      items: [
        {
          q: "What is #pragma?",
          a: "#pragma is a compiler-specific directive used to provide special instructions to compiler."
        },
        {
          q: "What is #pragma pack?",
          a: "It controls structure padding and alignment."
        },
        {
          q: "What is #pragma once?",
          a: "It prevents multiple inclusion of header files."
        }
      ]
    },
    {
      title: "Array of Structures",
      items: [
        {
          q: "What is an array of structures?",
          a: "It is a collection of structure variables stored in array form."
        },
        {
          q: "Why use array of structures?",
          a: "It helps store records like student or employee data efficiently."
        }
      ]
    },
    {
      title: "Pointer to Structures",
      items: [
        {
          q: "What is structure pointer?",
          a: "A pointer that stores address of structure variable is called structure pointer."
        },
        {
          q: "Explain arrow operator.",
          a: "Arrow operator (->) is used to access members using structure pointer."
        }
      ]
    },
    {
      title: "Passing Structures to Functions",
      items: [
        {
          q: "How can structures be passed to functions?",
          a: "Structures can be passed by value or by reference using pointers."
        },
        {
          q: "Which is more efficient?",
          a: "Passing by reference is more efficient because copying large structures is avoided."
        }
      ]
    },
    {
      title: "Bit Fields",
      items: [
        {
          q: "What are bit fields?",
          a: "Bit fields allocate specific number of bits to structure members."
        },
        {
          q: "Advantages of bit fields?",
          a: "They reduce memory usage and are useful in hardware programming."
        }
      ]
    },
    {
      title: "Unions",
      items: [
        {
          q: "What is a union?",
          a: "Union is a user-defined type where all members share same memory location."
        },
        {
          q: "Main advantage of unions?",
          a: "They save memory because only one member exists at a time."
        }
      ]
    },
    {
      title: "Enums",
      items: [
        {
          q: "What is enum?",
          a: "Enum is a user-defined type consisting of named integer constants."
        },
        {
          q: "Default enum value?",
          a: "The first enum value starts from 0 unless explicitly assigned."
        }
      ]
    },
    {
      title: "Linked Lists",
      items: [
        {
          q: "What is linked list?",
          a: "A linked list is a dynamic data structure made of nodes connected using pointers."
        },
        {
          q: "Advantages over arrays?",
          a: "Dynamic size and efficient insertion/deletion."
        }
      ]
    },
    {
      title: "Stack",
      items: [
        {
          q: "What is stack?",
          a: "Stack is a linear data structure following LIFO principle."
        },
        {
          q: "Main operations in stack?",
          a: "push(), pop(), peek()."
        }
      ]
    },
    {
      title: "Queue",
      items: [
        {
          q: "What is queue?",
          a: "Queue is a linear data structure following FIFO principle."
        },
        {
          q: "Main operations in queue?",
          a: "enqueue() and dequeue()."
        }
      ]
    },
    {
      title: "Priority Queue",
      items: [
        {
          q: "What is priority queue?",
          a: "Elements are removed based on priority instead of insertion order."
        },
        {
          q: "Applications of priority queue?",
          a: "CPU scheduling, Dijkstra algorithm, and event simulation."
        }
      ]
    },
    {
      title: "File Handling",
      items: [
        {
          q: "What is file handling in C?",
          a: "File handling allows storing and retrieving data permanently using files."
        },
        {
          q: "Functions used in file handling?",
          a: "fopen(), fclose(), fprintf(), fscanf(), fread(), fwrite()."
        },
        {
          q: "What is file redirection?",
          a: "Redirecting input/output using operators like > and < is called file redirection."
        }
      ]
    },
    {
      title: "Searching and Sorting",
      items: [
        {
          q: "Difference between linear and binary search?",
          a: "Linear search checks sequentially while binary search works on sorted arrays by dividing search space."
        },
        {
          q: "Best sorting algorithms in C?",
          a: "Quick sort, merge sort, bubble sort, insertion sort, and selection sort."
        }
      ]
    },
    {
      title: "Header Files",
      items: [
        {
          q: "What are header files?",
          a: "Header files contain declarations of functions, macros, and constants."
        },
        {
          q: "Difference between user-defined and standard header files?",
          a: "Standard headers use angle brackets while user-defined headers use double quotes."
        }
      ]
    },
    {
      title: "Variable Length Arguments",
      items: [
        {
          q: "What are variable length arguments?",
          a: "Functions accepting variable number of arguments use stdarg.h. Example: printf()."
        },
        {
          q: "Macros used in stdarg.h?",
          a: "va_start(), va_arg(), va_end()."
        }
      ]
    },
    {
      title: "Environment Variables",
      items: [
        {
          q: "What are environment variables?",
          a: "Dynamic values provided by operating system that affect program execution."
        },
        {
          q: "Functions for environment variables?",
          a: "getenv(), setenv(), putenv()."
        }
      ]
    },
    {
      title: "Preprocessor Directives",
      items: [
        {
          q: "What are preprocessor directives?",
          a: "Instructions processed before compilation are called preprocessor directives."
        },
        {
          q: "Examples of preprocessor directives?",
          a: "#include, #define, #ifdef, #ifndef, #pragma."
        }
      ]
    },
    {
      title: "Conditional Compilation",
      items: [
        {
          q: "What is conditional compilation?",
          a: "Conditional compilation compiles specific code based on conditions using #if, #ifdef, #ifndef."
        },
        {
          q: "Use of #ifdef?",
          a: "Checks whether a macro is defined or not."
        }
      ]
    }
      ,
    {
      title: "Coding Programs and Examples",
      items: [
        {
          q: "Program to find string length without strlen()",
          a: `#include<stdio.h>
int main(){
    char str[100];
    int i=0;
    printf("Enter string: ");
    scanf("%s",str);

    while(str[i] != '\0')
        i++;

    printf("Length = %d", i);
    return 0;
}`
        },
        {
          q: "Program using malloc()",
          a: `#include<stdio.h>
#include<stdlib.h>

int main(){
    int *ptr,n,i;

    printf("Enter size: ");
    scanf("%d",&n);

    ptr = (int*)malloc(n*sizeof(int));

    if(ptr == NULL){
        printf("Memory allocation failed");
        return 0;
    }

    for(i=0;i<n;i++){
        scanf("%d",&ptr[i]);
    }

    for(i=0;i<n;i++){
        printf("%d ",ptr[i]);
    }

    free(ptr);
    return 0;
}`
        },
        {
          q: "Program using structures",
          a: `#include<stdio.h>

struct student{
    int id;
    char name[50];
};

int main(){
    struct student s;

    s.id = 1;

    printf("Enter name: ");
    scanf("%s",s.name);

    printf("ID = %d\n",s.id);
    printf("Name = %s",s.name);

    return 0;
}`
        },
        {
          q: "Program for stack using array",
          a: `#include<stdio.h>
#define MAX 5

int stack[MAX], top=-1;

void push(int val){
    if(top==MAX-1)
        printf("Stack Overflow\n");
    else
        stack[++top]=val;
}

void pop(){
    if(top==-1)
        printf("Stack Underflow\n");
    else
        printf("Deleted element = %d\n", stack[top--]);
}

int main(){
    push(10);
    push(20);
    pop();
    return 0;
}`
        },
        {
          q: "Program for file handling",
          a: `#include<stdio.h>

int main(){
    FILE *fp;
    char ch;

    fp = fopen("sample.txt","w");

    fprintf(fp,"Hello File Handling");
    fclose(fp);

    fp = fopen("sample.txt","r");

    while((ch=fgetc(fp)) != EOF)
        printf("%c",ch);

    fclose(fp);
    return 0;
}`
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-cyan-400 mb-4">
            C Programming Complete Question Bank
          </h1>
          <p className="text-slate-300 text-lg">
            Detailed Important Questions, Answers, and Coding Examples for Semester Exams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.map((section, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl hover:border-cyan-400 transition-all"
            >
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">
                {section.title}
              </h2>

              <div className="space-y-5">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800 rounded-2xl p-4 border border-slate-700"
                  >
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                      Q{idx + 1}. {item.q}
                    </h3>
                    <pre className="text-slate-200 leading-7 whitespace-pre-wrap overflow-x-auto text-sm bg-slate-950 p-4 rounded-xl">{item.a}</pre>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-cyan-900/20 border border-cyan-500 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-cyan-300 mb-4">
            Deploy on Vercel
          </h2>

          <ol className="list-decimal ml-6 text-slate-200 space-y-3 text-lg">
            <li>Create a Next.js app using: npx create-next-app</li>
            <li>Replace page.jsx or page.tsx with this component.</li>
            <li>Push project to GitHub.</li>
            <li>Open Vercel and import GitHub repository.</li>
            <li>Click Deploy.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
