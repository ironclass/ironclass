// model data for testing the logic, just left the needed fields
let users = [
  {
    waving: false,
    username: "Andre".toLowerCase(),
    _id: "1",
    role: "Student"
  },
  {
    waving: false,
    username: "Malte".toLowerCase(),
    _id: "2",
    role: "Student"
  },
  {
    waving: false,
    username: "Stefanie".toLowerCase(),
    _id: "3",
    role: "Student"
  },
  {
    waving: false,
    username: "Min".toLowerCase(),
    _id: "4",
    role: "Student"
  },
  {
    waving: false,
    username: "Franzi".toLowerCase(),
    _id: "5",
    role: "Student"
  },
  {
    waving: false,
    username: "Amelia".toLowerCase(),
    _id: "6",
    role: "Student"
  },
  {
    waving: false,
    username: "Marvin".toLowerCase(),
    _id: "7",
    role: "Student"
  },
  {
    waving: false,
    username: "Ksenia".toLowerCase(),
    _id: "8",
    role: "Student"
  },
  {
    waving: false,
    username: "Felix".toLowerCase(),
    _id: "9",
    role: "Student"
  },
  {
    waving: false,
    username: "Julia".toLowerCase(),
    _id: "10",
    role: "Student"
  },
  {
    waving: false,
    username: ("Maxence" + "Teacher").toLowerCase(),
    _id: "11",
    role: "Teacher"
  },
  {
    waving: false,
    username: ("Thor" + "TA").toLowerCase(),
    _id: "12",
    role: "TA"
  }
];

class CallQueue {
  constructor(users, classObj) {
    this.users = users;
    this.students = this.users.filter(user => user.role === "Student");
    this.classObj = classObj;
    this.queue = classObj._callQueue;
  }

  isEmpty() {
    return this.queue.length === 0 ? true : false;
  }
  enqueue(element) {
    let queueArray = this.queue.map(obj => obj.toString());
    if (!queueArray.includes(element._id.toString())) {
      this.queue.unshift(element);
    }
    return this.queue;
  }
  dequeue() {
    if (this.isEmpty()) {
      return console.log("Queue empty");
    }
    return this.queue.pop();
  }

  // only students can wave/enqueue
  wave(user) {
    if (user.role === "Student") {
      this.enqueue(user._id);
    }
  }

  // only teachers and ta's can tick/dequeue
  tick(user) {
    if (user.role === "Teacher" || user.role === "TA") {
      this.dequeue();
    }
  }

  // option, to tick a specific student
  sudoTick(user, studentId) {
    if (user.role === "Teacher" || user.role === "TA" || user._id.toString() === studentId) {
      let indexInQueue = this.queue.findIndex(student => student._id.toString() === studentId);
      this.queue.splice(indexInQueue, 1);
    }
  }
}

module.exports = CallQueue;

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
