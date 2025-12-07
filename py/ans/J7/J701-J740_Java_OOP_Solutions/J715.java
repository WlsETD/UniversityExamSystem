import java.util.*;

class Score715 {
    int value;

    Score715(int value) {
        this.value = value;
    }

    char grade() {
        if (value >= 90) return 'A';
        if (value >= 80) return 'B';
        if (value >= 70) return 'C';
        return 'F';
    }
}

public class J715 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int v = sc.nextInt();
        Score715 s = new Score715(v);
        System.out.print(s.grade());
    }
}
