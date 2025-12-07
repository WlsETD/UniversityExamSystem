import java.util.*;

abstract class Employee732 {
    String name;

    Employee732(String name) {
        this.name = name;
    }

    abstract int getPay();
}

class HourlyEmployee732 extends Employee732 {
    int wage;
    int hours;

    HourlyEmployee732(String name, int wage, int hours) {
        super(name);
        this.wage = wage;
        this.hours = hours;
    }

    @Override
    int getPay() {
        return wage * hours;
    }
}

public class J732 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String name = sc.next();
        int wage = sc.nextInt();
        int hours = sc.nextInt();
        Employee732 e = new HourlyEmployee732(name, wage, hours);
        System.out.print(e.getPay());
    }
}
