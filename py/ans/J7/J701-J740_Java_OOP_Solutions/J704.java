import java.util.*;

class Employee704 {
    int hourlyWage;
    int hours;

    Employee704(int hourlyWage, int hours) {
        this.hourlyWage = hourlyWage;
        this.hours = hours;
    }

    int getSalary() {
        return hourlyWage * hours;
    }
}

public class J704 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int wage = sc.nextInt();
        int hours = sc.nextInt();
        Employee704 e = new Employee704(wage, hours);
        System.out.print(e.getSalary());
    }
}
