# API Testing Documentation

## Authentication

### POST /api/auth/register
| Test | Input | Expected | Result |
|---|---|---|---|
| Register new user | Valid email, password, name | 201 Created + token | OK |
| Duplicate email | Existing email | 400 Bad Request | OK |

### POST /api/auth/login
| Test | Input | Expected | Result |
|---|---|---|---|
| Valid credentials | Correct email + password | 200 OK + token | OK |
| Wrong password | Correct email + wrong password | 401 Unauthorized | OK |
| Wrong email | Non-existing email | 401 Unauthorized | OK |

## Courses

### GET /api/courses
| Test | Input | Expected | Result |
|---|---|---|---|
| Authenticated request | Valid token | 200 OK + courses array | OK |
| No token | No Authorization header | 401 Unauthorized | OK |

### POST /api/courses
| Test | Input | Expected | Result |
|---|---|---|---|
| Teacher creates course | TEACHER token + valid body | 201 Created | OK |
| Student tries to create | STUDENT token + valid body | 403 Forbidden | OK |

## Lessons

### GET /api/lessons
| Test | Input | Expected | Result |
|---|---|---|---|
| Get lessons by course | Valid token + courseId | 200 OK + lessons array | OK |

### POST /api/lessons
| Test | Input | Expected | Result |
|---|---|---|---|
| Teacher creates lesson | TEACHER token + valid body | 201 Created | OK |
| Student tries to create | STUDENT token + valid body | 403 Forbidden | OK |

## Questions

### GET /api/questions
| Test | Input | Expected | Result |
|---|---|---|---|
| Get questions by course | Valid token + courseId | 200 OK + questions array | OK |
| Filter by difficulty | Valid token + courseId + difficulty | 200 OK + filtered array | OK |

### POST /api/questions
| Test | Input | Expected | Result |
|---|---|---|---|
| Teacher creates question | TEACHER token + valid body | 201 Created | OK |
| Student tries to create | STUDENT token + valid body | 403 Forbidden | OK |

## Enrollments

### GET /api/enrollments
| Test | Input | Expected | Result |
|---|---|---|---|
| Get student enrollments | STUDENT token | 200 OK + enrollments array | OK |

### POST /api/enrollments
| Test | Input | Expected | Result |
|---|---|---|---|
| Student enrolls in course | STUDENT token + courseId | 201 Created | OK |
| Teacher tries to enroll | TEACHER token + courseId | 403 Forbidden | OK |
| Duplicate enrollment | Same student + same course | 500 Error | OK |

## Adaptive Engine

### GET /api/questions/next
| Test | Input | Expected | Result |
|---|---|---|---|
| Get next question | STUDENT token + courseId | 200 OK + question without answer | OK |
| Student not enrolled | STUDENT token + courseId | 404 Not Found | OK |
| No questions available | STUDENT token + empty course | 404 Not Found | OK |

### POST /api/answers
| Test | Input | Expected | Result |
|---|---|---|---|
| Correct answer | STUDENT token + correct option | 201 Created + isCorrect: true | OK |
| Wrong answer | STUDENT token + wrong option | 201 Created + isCorrect: false | OK |
| Level increases | >70% in last 5 answers | currentLevel + 1 | OK |
| Level decreases | <40% in last 5 answers | currentLevel - 1 | OK |
| Teacher tries to answer | TEACHER token | 403 Forbidden | OK |