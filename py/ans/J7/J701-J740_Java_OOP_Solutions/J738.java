import java.util.*;

class Student738 {
    String name;
    int id;
    private static int nextId = 1;

    private Student738(String name, int id) {
        this.name = name;
        this.id = id;
    }

    static Student738 create(String name) {
        Student738 s = new Student738(name, nextId);
        nextId++;
        return s;
    }

    String info() {
        return name + "#" + id;
    }
}

public class J738 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String n1 = sc.next();
        String n2 = sc.next();
        Student738 s1 = Student738.create(n1);
        Student738 s2 = Student738.create(n2);
        System.out.println(s1.info());
        System.out.print(s2.info());
    }
}
