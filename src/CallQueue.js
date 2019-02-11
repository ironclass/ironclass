// model data for testing the logic, just left the needed fields
let users = [
  {
    waving: false,
    username: "Andre".toLowerCase(),
    role: "Student"
  },
  {
    waving: false,
    username: "Malte".toLowerCase(),
    role: "Student"
  },
  {
    waving: false,
    username: "Stefanie".toLowerCase(),
    role: "Student"
  },
  {
    waving: false,
    username: "Min".toLowerCase(),
    role: "Student"
  },
  {
    waving: false,
    username: "Franzi".toLowerCase(),
    role: "Student"
  },
  {
    waving: false,
    username: "Amelia".toLowerCase(),
    role: "Student"
  },
  {
    waving: false,
    username: "Marvin".toLowerCase(),
    role: "Student"
  },
  {
    waving: false,
    username: "Ksenia".toLowerCase(),
    role: "Student"
  },
  {
    waving: false,
    username: "Felix".toLowerCase(),
    role: "Student"
  },
  {
    waving: false,
    username: "Julia".toLowerCase(),
    role: "Student"
  },
  {
    waving: false,
    username: ("Maxence" + "Teacher").toLowerCase(),
    role: "Teacher"
  },
  {
    waving: false,
    username: ("Thor" + "TA").toLowerCase(),
    role: "TA"
  }
];

class CallQueue {
  constructor(users) {
    this.users = users;
    this.students = this.users.filter(user => user.role === "Student");
    this.queue = [];
  }

  isEmpty() {
    return this.queue.length === 0 ? true : false;
  }
  enqueue(element) {
    this.queue.unshift(element);
    return this.queue;
  }
  dequeue() {
    if (this.isEmpty()) return "Queue empty";
    return this.queue.pop();
  }

  // only students can enqueue
  wave(user) {
    if (user.role === "Student") {
      user.waving = true;
      this.enqueue(user);
    }
  }

  // only teachers and ta's can dequeue
  tick(user) {
    if (user.role === "Teacher" || user.role === "TA") {
      this.queue[this.queue.length - 1].waving = false;
      this.dequeue();
    }
  }
  
  // option, to tick a specific student
  sudoTick(user, tickedStudent) {
    if (user.role === "Teacher" || user.role === "TA") {
      let indexInQueue = this.queue.findIndex(student => student.username === tickedStudent.username)
      this.queue[indexInQueue].waving = false;
      this.queue.splice(indexInQueue, 1)
    }
  }
}

// // TESTING
// let newQueue = new CallQueue(users);

// let andre = users[0];
// let malte = users[1];
// let stefanie = users[2];
// let min = users[3];
// let maxence = users[10];
// let thor = users[11];
// console.log('TCL: andre.waving', andre.waving)
// console.log('TCL: malte.waving', malte.waving)
// console.log('TCL: stefanie.waving', stefanie.waving)
// console.log('TCL: min.waving', min.waving)

// newQueue.wave(andre);
// console.log("TCL: newQueue.queue, waved", newQueue.queue);
// newQueue.wave(malte);
// console.log("TCL: newQueue.queue, waved", newQueue.queue);
// newQueue.wave(stefanie);
// console.log("TCL: newQueue.queue, waved", newQueue.queue);
// newQueue.wave(min);
// console.log("TCL: newQueue.queue, waved", newQueue.queue);
// newQueue.tick(thor);
// console.log("TCL: newQueue.queue, ticked", newQueue.queue);
// newQueue.sudoTick(maxence, min);
// console.log("TCL: newQueue.queue, ticked", newQueue.queue);

// console.log('TCL: malte.waving', malte.waving)
// console.log('TCL: andre.waving', andre.waving)
// console.log('TCL: stefanie.waving', stefanie.waving)
// console.log('TCL: min.waving', min.waving)