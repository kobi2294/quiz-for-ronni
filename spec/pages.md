# Pages of the web site

## Home Page
I want the student to see 2 tabs each containin a list. The first tab is titled "משימות שעוד לא עשיתי" and contains a list of the tasks that the student has not yet completed. The second tab is titled "משימות שעשיתי" and contains a list of the tasks that the student has completed.

In addition I want the home page to show my statistics, such as how many tasks I have completed and how many I have left to do. and my avg score on the tasks I have completed.

If there are tasks that I have started but not yet completed, I want to see a section that shows those tasks as well, with a progress bar indicating how much of the task I have completed.

Clicking on a task that is not completed should take me to the task page where I can continue working on it. Clicking on a completed task should take me to a page that shows my results for that task, including any feedback or comments from the teacher.

## Task Page
On task page, I should see a panel with list of questions. Each task is a list of questions. The panel will incude vertical numbers each representing a question. And for each number the color will tell me if this question was answered at all, and if it was answered correctly or not. 

My main navigation is by simply answering one question after another, but I should be able to click on any question number to jump to that question directly.

Each question will have a text with an embedded palce holder for the child to write answer. There can be more then one placeholder, for example:

```
The prime numbers between 1 and 10 are: __, __, __, __.
```

Next to each question there should be a button to submit the answer. Once I submit the answer, I should get immediate feedback on whether my answer is correct or not. If my answer is incorrect, I should be able to try again and I should see how many times I have tried. I get maximum of 3 attempts for each question, after which I can see the correct answer and move on to the next question.

# Quiz Data
I want to be able to define the quizes myself. All quizes should be stored in a folder called "quizes". When you build the application, find all the quizes in this folder and make them available in the application. Each quiz should be defined in a separate file, and the file name should be the name of the quiz. The format of the quiz file should be as follows:

```{
  "title": "Quiz Title",
  "questions": [
    {
      "text": "Question text with __ placeholders for answers.",
      "answers": ["correct answer 1", "correct answer 2", ...]
    },
    ...
  ]
}
```