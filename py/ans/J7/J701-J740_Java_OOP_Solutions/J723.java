import java.util.*;

class Employee723 {
    String name;
    int baseSalary;

    Employee723(String name, int baseSalary) {
        this.name = name;
        this.baseSalary = baseSalary;
    }

    int getPay() {
        return baseSalary;
    }
}

class Manager723 extends Employee723 {
    int bonus;

    Manager723(String name, int baseSalary, int bonus) {
        super(name, baseSalary);
        this.bonus = bonus;
    }

    @Override
    int getPay() {
        return baseSalary + bonus;
    }
}

public class J723 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String name = sc.next();
        int base = sc.nextInt();
        int bonus = sc.nextInt();
        Employee723 e = new Manager723(name, base, bonus);
        System.out.print(e.getPay());
    }
}
