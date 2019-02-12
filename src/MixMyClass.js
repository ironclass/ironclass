// model data for testing the logic, just left the needed fields
let users = [
  {
    _workedWith: [],
    _id: "3",
    username: "Andre".toLowerCase(),
    role: "Student"
  },
  {
    _workedWith: [],
    _id: "4",
    username: "Malte".toLowerCase(),
    role: "Student"
  },
  {
    _workedWith: [],
    _id: "5",
    username: "Stefanie".toLowerCase(),
    role: "Student"
  },
  {
    _workedWith: [],
    _id: "6",
    username: "Min".toLowerCase(),
    role: "Student"
  },
  {
    _workedWith: [],
    _id: "7",
    username: "Franzi".toLowerCase(),
    role: "Student"
  },
  {
    _workedWith: [],
    _id: "8",
    username: "Amelia".toLowerCase(),
    role: "Student"
  },
  {
    _workedWith: [],
    _id: "9",
    username: "Marvin".toLowerCase(),
    role: "Student"
  },
  {
    _workedWith: [],
    _id: "10",
    username: "Ksenia".toLowerCase(),
    role: "Student"
  },
  {
    _workedWith: [],
    _id: "11",
    username: "Felix".toLowerCase(),
    role: "Student"
  },
  {
    _workedWith: [],
    _id: "12",
    username: "Julia".toLowerCase(),
    role: "Student"
  },
  {
    _workedWith: [],
    _id: "13",
    username: ("Maxence" + "Teacher").toLowerCase(),
    role: "Teacher"
  },
  {
    _workedWith: [],
    _id: "14",
    username: ("Thor" + "TA").toLowerCase(),
    role: "TA"
  }
];

class MixMyClass {
  constructor(users, classObj) {
    this.users = users; // might not be necessary
    this.students = this.users.filter(user => user.role === "Student");
    this.classObj = classObj;
    this.currentGroups = classObj._currentGroups;
  }

  // standard fisher-yates shuffle, if option = repeat
  shuffle(students) {
    for (let i = students.length - 1; i > 0; i--) {
      // generate random index j
      const j = Math.floor(Math.random() * (i + 1));
      // swap last element with element at random index j
      [students[i], students[j]] = [students[j], students[i]];
    }
  }
  // shuffle, that takes the _workedWith property into account
  shuffleWithSequence(students) {
    function oneIteration() {
      times++;
      for (let i = students.length - 1; i > 0; i -= 2) {
        if (i - 1 < 0) {
          return students;
        }

        let j = Math.floor(Math.random() * (i + 1));

        // if second last student already worked together with student at random index j, regenerate random index

        let workedWithArray = students[i - 1]._workedWith.map(obj => obj.toString());

        while (workedWithArray.includes(students[j]._id.toString())) {
          console.log(
            `${students[i - 1].username} already worked with ${students[j].username}, dice again...`
          );
          j = Math.floor(Math.random() * (i + 1));
        }

        // swap last student with student at random index j -> this will create group of two, therfore decrease i by 2
        // hence it can happen, that the two remaining students already worked togther
        [students[i], students[j]] = [students[j], students[i]];
      }
      // to solve this issue, repeat the whole process again, try for max 99 times
      let workedWithArray = students[0]._workedWith.map(obj => obj.toString());
      if (workedWithArray.includes(students[1]._id.toString()) && times < 100) {
        console.log(
          `${times}: ${students[0].username} already worked with  ${students[1].username}, restart`
        );
        that.shuffle(students);
        oneIteration();
      }
    }
    let times = 0;
    let that = this;
    oneIteration();
  }

  // main method to create groups of different sizes, taking the present students into account with opt for not repeating group partners in groups of two
  createGroups(size = 2, notPresent = [], option = "noRepeat") {
    let presentStudents = this.students.filter(
      student => !notPresent.includes(student._id.toString())
    );

    let groups = [];

    // checking, that option is set to repeat, if group size is not equal to 2
    if (size != 2) {
      option = "repeat";
    }

    switch (option) {
      case "repeat":
        // shuffle all present students and divide in groups of "size"
        this.shuffle(presentStudents);

        while (presentStudents.length > 0) {
          groups.push(presentStudents.splice(0, size));
        }

        // return groups;
        break;

      case "noRepeat":
        // shuffle all present students respecting _workedWith property
        this.shuffleWithSequence(presentStudents);
        // console.log(`This is round ${round}`); // TESTING
        // round++; // TESTING

        while (presentStudents.length > 0) {
          groups.push(presentStudents.splice(0, size));
        }

        // pushing usernames of buddies in students _workedWith array
        groups.forEach(group => {
          group.forEach(student => {
            let currentStudent = student;
            let buddies = group.filter(student => student !== currentStudent);
            buddies.forEach(buddy => student._workedWith.push(buddy._id));
          });
        });

        // return groups;
        break;
    }
    this.currentGroups = groups;
    return groups;
  }
}

module.exports = MixMyClass;

// // TESTING
// let round = 0; // TESTING
// let newClass = new MixMyClass(users);

// newClass.createGroups(2, ["9", "10", "11", "12"]);
// newClass.createGroups(2, ["9", "10", "11", "12"]);
// newClass.createGroups(2, ["9", "10", "11", "12"]);
// newClass.createGroups(2, ["9", "10", "11", "12"]);
// newClass.createGroups(2, ["9", "10", "11", "12"]);
// newClass.createGroups(2, ["9", "10", "11", "12"]);

// console.log(
//   'TCL: newClass.createGroups(2, ["9", "10", "11", "12"]);',
//   newClass.createGroups(2, ["9", "10", "11", "12"])
// );
// console.log(
//   'TCL: newClass.createGroups(2, ["9", "10", "11", "12"]);',
//   newClass.createGroups(2, ["9", "10", "11", "12"])[0][0]
// );

// console.log(newClass.students[0]._id, newClass.students[0]._workedWith);
// console.log(newClass.students[1]._id, newClass.students[1]._workedWith);
// console.log(newClass.students[2]._id, newClass.students[2]._workedWith);
// console.log(newClass.students[3]._id, newClass.students[3]._workedWith);
// console.log(newClass.students[4]._id, newClass.students[4]._workedWith);
// console.log(newClass.students[5]._id, newClass.students[5]._workedWith);
// console.log(newClass.students[6]._id, newClass.students[6]._workedWith);
// console.log(newClass.students[7]._id, newClass.students[7]._workedWith);
// console.log(newClass.students[8]._id, newClass.students[8]._workedWith);
// console.log(newClass.students[9]._id, newClass.students[9]._workedWith);

// // TESTING GROUPS WITH DIFFERENT SIZES
// let groupsOfThree = newClass.createGroups(3, ["ksenia"]);
// console.log(groupsOfThree);
// let groupsOfFive = newClass.createGroups(5, ["ksenia"]);
// console.log(groupsOfFive);
