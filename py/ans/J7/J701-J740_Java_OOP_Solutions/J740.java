import java.util.*;

class Account740 {
    private int balance;

    Account740(int balance) {
        this.balance = balance;
    }

    void deposit(int amount) {
        balance += amount;
    }

    void withdraw(int amount) {
        if (amount <= balance) {
            balance -= amount;
        }
    }

    int getBalance() {
        return balance;
    }
}

public class J740 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int init = sc.nextInt();
        int dep = sc.nextInt();
        int wd = sc.nextInt();
        Account740 acc = new Account740(init);
        acc.deposit(dep);
        acc.withdraw(wd);
        System.out.print(acc.getBalance());
    }
}
