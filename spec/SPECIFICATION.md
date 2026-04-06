# Local Math Practice Website Specification

## 1. Overview

This document defines the full functional specification for a local-only website that allows a child to practice math problems.

The website is intended to run only on a local computer in a browser. It does not require internet connectivity for core functionality, does not depend on a server, and does not store any child data in the cloud.

This document is a product and behavior specification only. It does not define implementation details beyond what is necessary to clarify expected behavior.

## 2. Product Goal

The goal of the website is to help grade-school children practice basic math in a way that is simple, encouraging, and easy to use independently.

The experience should feel friendly, fast, and clear. A child should be able to start practicing within a few seconds, solve a short set of questions, get immediate feedback, and see progress over time on the same local device.

## 3. Core Principles

1. The website works locally only.
2. The user interface is fully in Hebrew.
3. The layout is fully RTL and must feel natural for Hebrew readers.
4. The child experience must be simple enough for independent use.
5. Practice must be short, clear, and motivating.
6. Progress is stored locally on the device only.
7. No account, login, email, or online sync is required.

## 4. Target Users

### Primary User

A grade-school child who wants to practice math exercises.

### Secondary User

A parent, teacher, or older sibling who may help choose level, review progress, or reset local data.

## 5. Language and Direction Requirements

1. All visible UI text must be in Hebrew.
2. The entire site must use RTL direction by default - But mathematical expressions should be displayed from left to right as is standard for math, even within the RTL layout.
3. Navigation order, alignment, spacing, labels, icons, and form controls must behave correctly in RTL.
4. Numbers and math expressions must remain readable and visually stable inside the RTL layout.
5. Any future audio, hints, instructions, and result messages must also be in Hebrew.

## 6. Local-Only Requirement

The website must function without any backend or remote service.

### Required behavior

1. The website runs from local files or a local development server on the same machine.
2. All question content is bundled with the site.
3. All saved data is stored locally in the browser on the same device.
4. The child can close the browser and return later to continue using saved local progress.

### Forbidden behavior

1. No login or user account system.
2. No server-side database.
3. No dependency on cloud storage.
4. No remote API calls for core product functionality.
5. No requirement for an active internet connection during normal usage.

## 7. Scope

### In Scope

1. Homepage for entering the practice experience.
2. Math practice by topic.
3. Difficulty or grade-level selection.
4. Practice sessions with individual questions.
5. Immediate feedback after each answer.
6. End-of-session summary.
7. Local progress tracking.
8. Basic settings or control area for resetting progress.

### Out of Scope

1. Multiplayer features.
2. Online leaderboards.
3. Teacher
2. As a child, I want to choose an easy, medium, or harder level so the questions fit me.
3. As a child, I want to answer one question at a time so I can stay focused.
4. As a child, I want immediate feedback so I know whether I was correct.
5. As a child, I want to see my score and progress so I feel improvement.
6. As a parent or teacher, I want local progress to remain on the device so I can review practice history.
7. As a parent or teacher, I want to reset saved progress locally when needed.

## 9. Information Architecture

The website should include  dashboard over the internet.
4. User authentication.
5. Payments or subscriptions.
6. Chat or social features.
7. Adaptive AI-generated questions from a remote service.

## 8. Main User Stories

1. As a child, I want to choose a math topic so I can practice the kind of problems I need.the following main areas.

1. Home page
2. Topic selection
3. Level selection
4. Practice session screen
5. Session summary screen
6. Progress screen
7. Local settings or data reset screen

These may be implemented as separate pages or as views within a single-page experience, but the user-facing behavior must match this structure.

## 10. Functional Areas

### 10.1 Home Page

The home page introduces the site and allows the child to begin quickly.

#### Required elements

1. Clear Hebrew title and short explanation.
2. Main action to start practice.
3. Visual explanation of available math topics.
4. Entry point to progress view.
5. Friendly design appropriate for children.

#### Expected behavior

1. A child should be able to start a session from the home page in one or two clicks.
2. The home page should not feel crowded.
3. The layout should work well on desktop and tablet sizes, and reasonably on mobile.

### 10.2 Topic Selection

The child can choose which type of math to practice.

#### Initial required topics

1. Addition
2. Subtraction
3. Multiplication
4. Division
5. Mixed practice

#### Optional future topics

1. Word problems
2. Fractions
3. Time and money
4. Geometry basics

#### Topic behavior

1. Each topic should have a clear Hebrew label.
2. Each topic may include a short explanation in simple Hebrew.
3. Mixed practice should combine more than one operation.

### 10.3 Level Selection

The child can select a difficulty or learning stage.

#### Required initial levels

1. Beginner
2. Intermediate
3. Advanced

The actual Hebrew labels may be child-friendly equivalents, but the meaning must remain clear.

#### Level behavior

1. The selected level determines question range and complexity.
2. Each topic must support at least one level.
3. If a topic does not yet support a certain level, the UI must make that clear.

### 10.4 Practice Session

The practice session is the core experience.

#### Session structure

1. A session contains a short set of math questions.
2. The default session length should be small enough for a child to complete comfortably.
3. A reasonable starting requirement is 5 to 10 questions per session.

#### Question display requirements

1. Show one question at a time.
2. Present the math expression clearly and with large readable text.
3. Keep distractions minimal during answering.
4. Show current question number and total question count.
5. Show the chosen topic and level.

#### Answer input requirements

1. The child can type a numeric answer.
2. There should be a clear submit action.
3. There should be an easy way to move to the next question after feedback.
4. Input should be forgiving about accidental leading or trailing spaces.
5. Invalid non-numeric input should trigger a clear Hebrew message.

#### Feedback requirements

1. After submitting, the child immediately sees whether the answer is correct or incorrect.
2. Positive feedback should feel encouraging but not noisy.
3. Incorrect feedback should be supportive and clear.
4. The correct answer should be shown after an incorrect submission.
5. The child must be able to continue without confusion.

#### Session controls

1. Start session
2. Submit answer
3. Next question
4. Exit session
5. Restart session

If the child exits early, the product should define whether the partial session is saved. The recommended behavior is to save it as incomplete only if that adds value without confusion.

### 10.5 Session Summary

At the end of a practice session, the child sees a summary screen.

#### Required summary information

1. Number of correct answers
2. Number of incorrect answers
3. Completion percentage
4. Encouraging Hebrew message
5. Option to try again
6. Option to return home
7. Option to continue with another session

#### Optional summary details

1. Which questions were missed
2. Suggested next level or next topic
3. Best score in this topic and level

### 10.6 Progress Tracking

The site should store and display local progress on the same device.

#### Required tracked data

1. Total sessions completed
2. Total questions answered
3. Correct answer count
4. Accuracy percentage
5. Best score by topic
6. Last practice date

#### Optional tracked data

1. Progress by level
2. Streak of active practice days
3. Most practiced topic
4. Recently completed sessions

#### Progress behavior

1. Progress must be stored locally only.
2. The progress screen must be readable by a child or adult.
3. Progress visuals should be simple and not require explanation.

### 10.7 Local Settings and Data Reset

The site should include a basic local settings area.

#### Required controls

1. Reset all local progress
2. Confirm before destructive reset
3. Return to home page

#### Optional controls

1. Toggle sounds on or off
2. Choose session length
3. Choose larger text mode

## 11. Question System Specification

### 11.1 Question Types

The first version should support standard arithmetic questions with a single numeric answer.

#### Required supported formats

1. Addition expression, for example 3 + 4
2. Subtraction expression, for example 9 - 2
3. Multiplication expression, for example 5 x 6
4. Division expression with whole-number answers, for example 12 / 3

### 11.2 Question Rules

1. Questions must be age-appropriate.
2. Difficulty must change the number range and complexity.
3. Early versions should avoid ambiguous formats.
4. Division questions should initially produce whole-number answers only.
5. Negative results should only appear if explicitly allowed by the selected level.

### 11.3 Initial Difficulty Definition

These values are placeholders for the first product version and may be adjusted later.

#### Beginner

1. Small positive numbers
2. Simple one-step problems
3. No negative answers
4. No remainders in division

#### Intermediate

1. Larger positive numbers
2. Multi-digit addition and subtraction where appropriate
3. Basic multiplication tables
4. Division with whole-number answers

#### Advanced

1. Larger ranges
2. Faster recall expected
3. More mixed practice
4. More challenging combinations within grade-school ability

## 12. Child Experience Requirements

1. The interface must avoid clutter.
2. The primary action on each screen must be obvious.
3. Feedback language must be supportive, not punitive.
4. Sessions should be short enough to reduce fatigue.
5. Buttons and text should be large enough for children.
6. The child should never need to read a long paragraph to continue.

## 13. Visual and UX Requirements

1. The site should look friendly, modern, and playful.
2. The visual language should be suitable for grade-school children without feeling babyish.
3. Important actions must stand out clearly.
4. The layout must remain coherent in Hebrew RTL.
5. Color and visual feedback should support understanding.
6. Animations, if used, must be brief and meaningful.
7. The product should feel fast and responsive.

## 14. Accessibility Requirements

1. Text must have sufficient contrast.
2. Buttons and inputs must be large enough to interact with comfortably.
3. The site must be usable with keyboard navigation.
4. Focus states must be visible.
5. Labels and instructions must be clear.
6. The layout must remain understandable when zoomed.
7. Screen-reader-friendly structure is preferred where feasible.

## 15. Data Model Requirements

The exact implementation format is not specified here, but the product must conceptually support the following local data.

### Required stored data

1. Selected topic
2. Selected level
3. Session history
4. Number of correct and incorrect answers
5. Aggregate progress metrics
6. Last used settings

### Optional stored data

1. Sound preference
2. Preferred session length
3. Best score records

## 16. Performance Requirements

1. The site should load quickly on a typical local computer.
2. Starting a session should feel immediate.
3. Moving between questions should be instant or near-instant.
4. Local progress saving should happen without visible delay.

## 17. Error Handling Requirements

1. Empty answer submission must show a clear Hebrew prompt.
2. Invalid answer submission must show a clear Hebrew prompt.
3. Missing local data should not break the app.
4. Corrupted local data should fail gracefully where possible.
5. Reset actions must require confirmation.

## 18. Suggested Screens and Content Blocks

### Screen 1: Home

1. Site title
2. Short explanation
3. Start practice button
4. Topic preview cards
5. Link to progress

### Screen 2: Choose Topic and Level

1. Topic list or cards
2. Level options
3. Start session button

### Screen 3: Practice Session

1. Progress indicator
2. Math question
3. Numeric input
4. Submit button
5. Feedback area
6. Next button

### Screen 4: Summary

1. Session result
2. Score breakdown
3. Retry button
4. Home button
5. Continue button

### Screen 5: Progress

1. Total sessions
2. Accuracy
3. Best topic results
4. Recent activity

### Screen 6: Settings

1. Reset progress control
2. Confirmation dialog or confirmation step

## 19. Content Tone Requirements

All Hebrew copy should follow these rules.

1. Short and simple sentences
2. Friendly tone
3. Encouraging language
4. No harsh error wording
5. Clear action labels

Examples of message intent include success, retry encouragement, and simple instructions, but the final Hebrew copy can be defined later during implementation.

## 20. Future Enhancements

These are not part of the initial required build, but the product structure should not block them.

1. Timed challenge mode
2. Printable worksheets
3. Parent summary mode
4. Multiple child profiles on the same device
5. Achievement badges
6. Word problems
7. Audio support in Hebrew

## 21. Acceptance Criteria for the Initial Product

The initial product should be considered complete only if all of the following are true.

1. The website runs locally without requiring a backend.
2. The website interface is fully in Hebrew.
3. The entire layout behaves correctly in RTL.
4. A child can choose a math topic and level.
5. A child can complete a short practice session.
6. The site gives immediate feedback for each answer.
7. The site shows a summary at the end of a session.
8. The site stores progress locally on the device.
9. A user can view progress and reset local data.
10. The experience is simple enough for a grade-school child to use.

## 22. Open Decisions for Later

These points should be confirmed before implementation starts.

1. Exact Hebrew product name
2. Exact Hebrew labels for difficulty levels
3. Default session length
4. Whether partial sessions are saved
5. Whether sound effects are included in version one
6. Whether mixed practice is available immediately or after single-topic practice

## 23. Summary

This website is a local-only Hebrew RTL math practice product for grade-school children. It should provide a simple, encouraging flow from choosing a topic to solving questions, receiving feedback, viewing results, and tracking progress locally on the device.

No implementation should begin until this specification is reviewed and any open decisions are resolved.